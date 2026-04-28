import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppNavigator, AuthNavigator } from './src/navigation/AppNavigator';

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#e91e8c" />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#e91e8c',
    background: '#0a0a1a',
    card: '#0f0f2a',
    text: '#ffffff',
    border: 'rgba(255,255,255,0.1)',
    notification: '#e91e8c',
  },
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={customDarkTheme}>
        <StatusBar style="light" backgroundColor="#0a0a1a" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
