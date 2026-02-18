import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMonitorContext } from '../hooks/useMonitorContext';
import { theme } from '../theme/theme';

const AlertModal = () => {
  const { activeAlert, acknowledgeAlert } = useMonitorContext();

  return (
    <Modal visible={Boolean(activeAlert)} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>ALERTA DE PORTARIA</Text>
          <Text style={styles.body}>
            Veículo {activeAlert?.vehicleId} da {activeAlert?.carrier} está em CHAMADO DA PORTARIA.
          </Text>
          <Text style={styles.meta}>Horário do chamado: {activeAlert?.calledAt}</Text>
          <TouchableOpacity style={styles.button} onPress={acknowledgeAlert}>
            <Text style={styles.buttonText}>CONFIRMAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderColor: theme.colors.danger,
    borderWidth: 2,
    padding: 24,
    gap: 12
  },
  title: { color: theme.colors.danger, fontWeight: '800', fontSize: 22 },
  body: { color: theme.colors.text, fontSize: 16 },
  meta: { color: theme.colors.muted, fontSize: 12 },
  button: {
    marginTop: 8,
    backgroundColor: theme.colors.danger,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14
  },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 }
});

export default AlertModal;
