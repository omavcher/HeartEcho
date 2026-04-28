import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeCosAi() {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Your AI Girlfriend/Boyfriend Awaits</Text>
        <Text style={styles.subtitle}>
          Meet your perfect AI companion.{'\n'}
          Chat, connect, and feel understood every day.
        </Text>
      </View>
      <Image 
        source={require('../../assets/icon.png')} 
        style={styles.image} 
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(206,64,133,0.1)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
  },
  image: {
    width: width - 80,
    height: 150,
  }
});
