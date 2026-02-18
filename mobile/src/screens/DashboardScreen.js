import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMonitorContext } from '../hooks/useMonitorContext';
import { theme } from '../theme/theme';

const Stat = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const DashboardScreen = () => {
  const { dashboard, syncAll, isLoading } = useMonitorContext();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={syncAll} tintColor={theme.colors.primary} />}
    >
      <Text style={styles.title}>Dashboard em tempo real</Text>
      <View style={styles.grid}>
        <Stat label="Total em FILA" value={dashboard?.totalFila ?? 0} />
        <Stat label="Veículos monitorados" value={dashboard?.totalVehicles ?? 0} />
        <Stat label="Alertas ativos" value={dashboard?.activeAlerts ?? 0} />
      </View>
      <Text style={styles.subtitle}>Última sincronização: {dashboard?.lastSync || '-'}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  title: { color: theme.colors.text, fontWeight: '700', fontSize: 24, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    borderColor: '#253145',
    borderWidth: 1
  },
  statLabel: { color: theme.colors.muted, fontSize: 13 },
  statValue: { color: theme.colors.primary, fontWeight: '800', fontSize: 28, marginTop: 10 },
  subtitle: { color: theme.colors.muted, marginTop: 20 }
});

export default DashboardScreen;
