import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import MonitoringScreen from './src/screens/MonitoringScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AlertModal from './src/components/AlertModal';
import { MonitorProvider } from './src/hooks/useMonitorContext';
import { theme } from './src/theme/theme';

const Tab = createBottomTabNavigator();

const iconMap = {
  Painel: 'dashboard',
  Monitoramento: 'monitor',
  Histórico: 'history',
  Configurações: 'settings'
};

export default function App() {
  return (
    <SafeAreaProvider>
      <MonitorProvider>
        <NavigationContainer theme={theme.navigation}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerStyle: { backgroundColor: theme.colors.surface },
              headerTintColor: theme.colors.text,
              tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: '#1c2635' },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.muted,
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name={iconMap[route.name]} size={size} color={color} />
              )
            })}
          >
            <Tab.Screen name="Painel" component={DashboardScreen} />
            <Tab.Screen name="Monitoramento" component={MonitoringScreen} />
            <Tab.Screen name="Histórico" component={HistoryScreen} />
            <Tab.Screen name="Configurações" component={SettingsScreen} />
          </Tab.Navigator>
          <AlertModal />
        </NavigationContainer>
      </MonitorProvider>
    </SafeAreaProvider>
  );
}
