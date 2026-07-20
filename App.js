import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

import DashboardScreen from './src/screens/DashboardScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import { initializeRevenueCat } from './src/services/RevenueCatService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    registerForPushNotifications();
    initializeRevenueCat();
  }, []);

  async function registerForPushNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
              else if (route.name === 'Invoice') iconName = focused ? 'document-text' : 'document-text-outline';
              else if (route.name === 'Upgrade') iconName = focused ? 'rocket' : 'rocket-outline';
              else if (route.name === 'Insights') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4A90E2',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarStyle: { backgroundColor: '#0A1628', borderTopColor: '#1C2E4A' },
            headerStyle: { backgroundColor: '#0A1628' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: 'bold' },
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Invoice" component={InvoiceScreen} />
          <Tab.Screen name="Upgrade" component={PaywallScreen} options={{ headerTitle: 'Upgrade to Pro' }} />
          <Tab.Screen name="Insights" component={InsightsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
