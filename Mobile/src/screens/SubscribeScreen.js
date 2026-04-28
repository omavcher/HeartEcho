import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    color: '#666',
    features: [
      '5 messages per day',
      'Access to 3 AI friends',
      'Basic chat features',
      'Community stories',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹99',
    period: 'per month',
    color: '#e91e8c',
    popular: true,
    features: [
      'Unlimited messages',
      'All AI friends unlocked',
      'Voice calls with AI',
      'Priority AI responses',
      'Exclusive stories',
      'No ads',
    ],
    cta: 'Upgrade to Pro',
    disabled: false,
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: '₹799',
    period: 'per year  (save 33%)',
    color: '#8b5cf6',
    features: [
      'Everything in Pro',
      'Exclusive annual badge',
      'Early access to features',
      'Priority support',
    ],
    cta: 'Get Yearly',
    disabled: false,
  },
];

export default function SubscribeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a0533', '#2d1b69']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose a Plan</Text>
        <Text style={styles.headerSub}>Unlock the full HeartEcho experience</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {plans.map((plan) => (
          <View key={plan.id} style={[styles.card, plan.popular && styles.cardPopular]}>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>⭐ MOST POPULAR</Text>
              </View>
            )}
            <LinearGradient
              colors={plan.popular ? ['rgba(233,30,140,0.15)', 'rgba(139,92,246,0.1)'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.cardGrad}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
                <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
              </View>

              <View style={styles.featureList}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.ctaBtn, plan.disabled && styles.ctaBtnDisabled]}
                disabled={plan.disabled}
                onPress={() => {/* TODO: open payment or deep link to web */}}
              >
                <LinearGradient
                  colors={plan.disabled ? ['#2a2a3a', '#1a1a2a'] : [plan.color, plan.color + 'bb']}
                  style={styles.ctaBtnGrad}
                >
                  <Text style={[styles.ctaBtnText, plan.disabled && { color: '#555' }]}>
                    {plan.cta}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}

        <Text style={styles.footer}>
          Subscriptions are managed via our website.{'\n'}
          Existing subscribers are synced automatically.
        </Text>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center' },
  backBtn: { position: 'absolute', top: 56, left: 20, padding: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerSub: { color: '#c084fc', fontSize: 13 },
  body: { padding: 20, gap: 16 },
  card: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardPopular: { borderColor: '#e91e8c', borderWidth: 2 },
  popularBadge: { backgroundColor: '#e91e8c', paddingVertical: 6, alignItems: 'center' },
  popularBadgeText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  cardGrad: { padding: 20 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  planName: { fontSize: 20, fontWeight: '800' },
  planPeriod: { color: '#666', fontSize: 12, marginTop: 2 },
  planPrice: { fontSize: 30, fontWeight: '900' },
  featureList: { gap: 10, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { color: '#c0c0e0', fontSize: 14 },
  ctaBtn: { borderRadius: 14, overflow: 'hidden' },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footer: { textAlign: 'center', color: '#444', fontSize: 12, lineHeight: 18, marginTop: 8 },
});
