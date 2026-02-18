import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { theme } from '../theme/theme';

const SettingsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Configurações</Text>
    <View style={styles.item}>
      <Text style={styles.label}>Monitoramento em segundo plano</Text>
      <Switch value thumbColor={theme.colors.primary} />
    </View>
    <View style={styles.item}>
      <Text style={styles.label}>Notificações de alta prioridade</Text>
      <Switch value thumbColor={theme.colors.primary} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  item: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: { color: theme.colors.text, maxWidth: '80%' }
});

export default SettingsScreen;
