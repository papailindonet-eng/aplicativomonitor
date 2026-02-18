import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useMonitorContext } from '../hooks/useMonitorContext';
import { theme } from '../theme/theme';

const HistoryScreen = () => {
  const { history } = useMonitorContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Chamados</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>Veículo: {item.vehicleId}</Text>
            <Text style={styles.text}>Transportadora: {item.carrier}</Text>
            <Text style={styles.text}>Chamado: {item.calledAt}</Text>
            <Text style={styles.text}>Confirmado: {item.confirmedAt || 'Pendente'}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: { backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, marginBottom: 8 },
  text: { color: theme.colors.text, marginBottom: 3 }
});

export default HistoryScreen;
