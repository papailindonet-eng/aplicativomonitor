import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN || 'change-me';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 9000,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`
  }
});

export const fetchDashboard = async () => (await api.get('/dashboard')).data;
export const fetchMonitoring = async () => (await api.get('/monitoring')).data;
export const fetchHistory = async () => (await api.get('/events/calls')).data;
export const fetchActiveAlerts = async () => (await api.get('/alerts/active')).data;
export const confirmAlert = async (id) => (await api.post(`/alerts/${id}/confirm`, { acknowledgedBy: 'app-user' })).data;
