import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const steps = [
  {
    number: 1,
    icon: "👤",
    title: "Select Companion",
    description: "Choose from diverse AI personalities or customize your unique virtual partner.",
  },
  {
    number: 2,
    icon: "💬",
    title: "Chat & Connect",
    description: "Engage in deep, meaningful conversations that evolve with every message.",
    highlighted: true
  },
  {
    number: 3,
    icon: "🚀",
    title: "Level Up",
    description: "Unlock exclusive features and deepen the bond as your relationship grows.",
  }
];

export default function StepsHome() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>How It <Text style={styles.pinkText}>Works</Text></Text>
        <Text style={styles.subtitle}>Start your journey in three simple steps</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {steps.map((step, index) => (
          <View key={step.number} style={[styles.card, step.highlighted && styles.cardHighlighted]}>
            <View style={styles.cardTop}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>{step.number}</Text>
              </View>
              <Text style={styles.icon}>{step.icon}</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.desc}>{step.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  pinkText: {
    color: '#cf4185',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: 260,
    backgroundColor: '#0f0f1a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
  },
  cardHighlighted: {
    borderColor: 'rgba(207,65,133,0.5)',
    backgroundColor: 'rgba(207,65,133,0.05)',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepCircle: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: '#cf4185',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  desc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 18,
  }
});
