import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'node:fs/promises';
import path from 'node:path';
import pino from 'pino';

const PORT = process.env.PORT || 4000;
const APP_TOKEN = process.env.APP_TOKEN || 'change-me';
const SOURCE_URL = process.env.SOURCE_URL || 'https://agendeam.com.br/ujf/motorista.php';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 10000);
const DB_PATH = path.resolve(process.cwd(), 'data/store.json');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const state = {
  lastSync: null,
  stale: false,
  vehicles: [],
  vehiclesById: new Map(),
  calledHistory: [],
  activeAlerts: [],
  errors: []
};

const ensureStorage = async () => {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    const existing = await fs.readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(existing);
    state.lastSync = parsed.lastSync || null;
    state.stale = parsed.stale || false;
    state.vehicles = parsed.vehicles || [];
    state.calledHistory = parsed.calledHistory || [];
    state.activeAlerts = parsed.activeAlerts || [];
    state.vehiclesById = new Map(state.vehicles.map((vehicle) => [vehicle.id, vehicle]));
  } catch {
    await persistState();
  }
};

const persistState = async () => {
  const payload = {
    lastSync: state.lastSync,
    stale: state.stale,
    vehicles: state.vehicles,
    calledHistory: state.calledHistory,
    activeAlerts: state.activeAlerts
  };
  await fs.writeFile(DB_PATH, JSON.stringify(payload, null, 2));
};

const normalizeText = (value) => value?.replace(/\s+/g, ' ').trim() ?? '';

const parseVehicles = (html) => {
  const $ = cheerio.load(html);
  const rows = [];

  $('table tr').each((_, row) => {
    const cells = $(row)
      .find('td')
      .map((__, cell) => normalizeText($(cell).text()))
      .get();

    if (cells.length < 3) return;

    const [vehicleId, status, carrier] = cells;
    const candidate = {
      id: vehicleId,
      status,
      carrier,
      rawColumns: cells,
      seenAt: new Date().toISOString()
    };

    if (candidate.id && candidate.status && candidate.carrier) {
      rows.push(candidate);
    }
  });

  return rows;
};

const updateDomainState = async (freshVehicles) => {
  const freshMap = new Map(freshVehicles.map((vehicle) => [vehicle.id, vehicle]));
  const calledNow = new Date().toISOString();

  for (const vehicle of freshVehicles) {
    const previous = state.vehiclesById.get(vehicle.id);
    const statusChanged = previous && previous.status !== vehicle.status;

    if (vehicle.status === 'CHAMADO DA PORTARIA' && (!previous || statusChanged)) {
      const event = {
        id: `${vehicle.id}-${Date.now()}`,
        vehicleId: vehicle.id,
        carrier: vehicle.carrier,
        status: vehicle.status,
        calledAt: calledNow,
        confirmedAt: null
      };
      state.calledHistory.unshift(event);

      if (vehicle.carrier === 'TRANSPORTADORA SEIS') {
        state.activeAlerts.unshift({
          ...event,
          acknowledgedBy: null,
          confirmRequired: true
        });
      }
    }
  }

  state.vehicles = freshVehicles;
  state.vehiclesById = freshMap;
  state.lastSync = calledNow;
  state.stale = false;
  state.calledHistory = state.calledHistory.slice(0, 500);
  state.activeAlerts = state.activeAlerts.filter((alert) => !alert.confirmedAt);

  await persistState();
};

const pollSource = async () => {
  try {
    const response = await axios.get(SOURCE_URL, { timeout: 8000 });
    const vehicles = parseVehicles(response.data);

    if (!vehicles.length) {
      throw new Error('Nenhum veículo encontrado na origem');
    }

    await updateDomainState(vehicles);
    logger.info({ totalVehicles: vehicles.length }, 'Sincronização concluída');
  } catch (error) {
    state.stale = true;
    state.errors.unshift({ at: new Date().toISOString(), message: error.message });
    state.errors = state.errors.slice(0, 20);
    await persistState();
    logger.error({ err: error }, 'Falha durante monitoramento');
  }
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (token !== APP_TOKEN) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  return next();
};

const app = express();
app.use(cors());
app.use(express.json());
const publicPaths = new Set(['/', '/api/health']);

app.use((req, res, next) => {
  if (publicPaths.has(req.path)) return next();
  return authMiddleware(req, res, next);
});

app.get('/', (_, res) => {
  res.json({
    name: 'Monitor de Pátio API',
    status: 'online',
    health: '/api/health',
    auth: 'Use Authorization: Bearer <APP_TOKEN> nos endpoints protegidos.'
  });
});

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', lastSync: state.lastSync, stale: state.stale });
});

app.get('/api/dashboard', (_, res) => {
  const filaCount = state.vehicles.filter((item) => item.status === 'FILA').length;
  res.json({
    totalFila: filaCount,
    totalVehicles: state.vehicles.length,
    activeAlerts: state.activeAlerts.length,
    lastSync: state.lastSync,
    stale: state.stale,
    vehicles: state.vehicles
  });
});

app.get('/api/monitoring', (_, res) => {
  res.json({
    source: SOURCE_URL,
    refreshIntervalMs: POLL_INTERVAL_MS,
    stale: state.stale,
    errors: state.errors,
    vehicles: state.vehicles
  });
});

app.get('/api/events/calls', (_, res) => {
  res.json({ events: state.calledHistory });
});

app.get('/api/alerts/active', (_, res) => {
  res.json({ alerts: state.activeAlerts.filter((alert) => !alert.confirmedAt) });
});

app.post('/api/alerts/:id/confirm', async (req, res) => {
  const alert = state.activeAlerts.find((item) => item.id === req.params.id && !item.confirmedAt);
  if (!alert) {
    return res.status(404).json({ error: 'Alerta não encontrado' });
  }

  alert.confirmedAt = new Date().toISOString();
  alert.acknowledgedBy = req.body?.acknowledgedBy || 'mobile-user';

  const historyItem = state.calledHistory.find((item) => item.id === alert.id);
  if (historyItem) {
    historyItem.confirmedAt = alert.confirmedAt;
  }

  await persistState();
  return res.json({ success: true, alert });
});

await ensureStorage();
await pollSource();
setInterval(pollSource, POLL_INTERVAL_MS);

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Backend iniciado');
});
