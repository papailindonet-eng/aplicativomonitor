import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { confirmAlert, fetchActiveAlerts, fetchDashboard, fetchHistory, fetchMonitoring } from '../services/api';

const REFRESH_TASK = 'background-monitor-refresh';
const MonitorContext = createContext(null);

TaskManager.defineTask(REFRESH_TASK, async () => {
  try {
    await fetchDashboard();
    await fetchActiveAlerts();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const MonitorProvider = ({ children }) => {
  const [dashboard, setDashboard] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncAll = async () => {
    const [dash, mon, hist, alerts] = await Promise.all([
      fetchDashboard(),
      fetchMonitoring(),
      fetchHistory(),
      fetchActiveAlerts()
    ]);

    setDashboard(dash);
    setMonitoring(mon);
    setHistory(hist.events || []);
    setActiveAlert((alerts.alerts || [])[0] || null);
    setIsLoading(false);
  };

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    syncAll();
    const timer = setInterval(syncAll, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const registerBackgroundTask = async () => {
      await BackgroundFetch.registerTaskAsync(REFRESH_TASK, {
        minimumInterval: 60,
        stopOnTerminate: false,
        startOnBoot: true
      });
    };

    registerBackgroundTask();
  }, []);

  useEffect(() => {
    const triggerAlert = async () => {
      if (!activeAlert) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'ALERTA CRÍTICO',
          body: `Veículo ${activeAlert.vehicleId} da TRANSPORTADORA SEIS chamado na portaria.`,
          priority: Notifications.AndroidNotificationPriority.MAX,
          sound: true,
          sticky: true
        },
        trigger: null
      });
    };

    triggerAlert();
  }, [activeAlert?.id]);

  const acknowledgeAlert = async () => {
    if (!activeAlert) return;
    await confirmAlert(activeAlert.id);
    await syncAll();
  };

  const value = useMemo(
    () => ({ dashboard, monitoring, history, activeAlert, isLoading, syncAll, acknowledgeAlert }),
    [dashboard, monitoring, history, activeAlert, isLoading]
  );

  return <MonitorContext.Provider value={value}>{children}</MonitorContext.Provider>;
};

export const useMonitorContext = () => {
  const context = useContext(MonitorContext);
  if (!context) throw new Error('MonitorContext indisponível');
  return context;
};
