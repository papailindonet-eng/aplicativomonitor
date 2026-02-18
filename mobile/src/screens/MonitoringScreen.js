import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useMonitorContext } from '../hooks/useMonitorContext';
import { theme } from '../theme/theme';

const MonitoringScreen = () => {
  const { monitoring } = useMonitorContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoramento contínuo (10s)</Text>
      <FlatList
        data={monitoring?.vehicles || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.plate}>{item.id}</Text>
            <Text style={styles.status}>{item.status}</Text>
            <Text style={styles.carrier}>{item.carrier}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  plate: { color: theme.colors.text, fontWeight: '700' },
  status: { color: theme.colors.primary },
  carrier: { color: theme.colors.muted, fontSize: 12 }
});

export default MonitoringScreen;
