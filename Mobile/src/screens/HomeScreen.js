import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import api from '../config/api';

// Sections
import AiLiveView from '../components/AiLiveView';
import HomeAiModels from '../components/HomeAiModels';
import HomeLiveStories from '../components/HomeLiveStories';
import StepsHome from '../components/StepsHome';
import HomeFAQ from '../components/HomeFAQ';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [quota, setQuota] = useState(null);

  const fetchQuota = async () => {
    try {
      if (user?.email) {
        const { data } = await axios.post(`${api.Url}/get-quota`, { email: user.email });
        if (data.success) setQuota(data.data);
      }
    } catch (err) {
      console.log('Quota fetch error:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuota();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchQuota();
  }, [user]);

  // Is Free Plan?
  const isFree = user?.user_type === 'free_user' || user?.plan_type === 'free';

  return (
    <View style={styles.container}>
      {/* 1. Base dark background matching CSS --bg-dark */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#050505' }]} />

      {/* 2. Web's "hero-background-glow" */}
      <View style={styles.glowOrb} />

      {/* 3. Identical Global Noise Overlay from Web using the Exact URL */}
      <View style={styles.noiseOverlay} pointerEvents="none">
         <Image 
           source={{ uri: "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E" }}
           style={StyleSheet.absoluteFillObject}
           resizeMode="repeat"
         />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#cf4185" />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0] || 'There'} 👋</Text>
          <Text style={styles.subtitle}>Ready for your next conversation?</Text>

          {/* Quota Tracker */}
          {isFree && quota !== null && (
            <View style={styles.quotaBox}>
              <View style={styles.quotaHeader}>
                <Text style={styles.quotaTitle}>Daily Free Messages</Text>
                <Text style={styles.quotaCount}>{quota} / 5</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${(quota / 5) * 100}%` }]} />
              </View>
            </View>
          )}
        </View>

        {/* AI Live Studio Strip - Instagram style */}
        <AiLiveView navigation={navigation} />

        <View style={styles.separator} />

        {/* AI Models Grid - Web Homepage Mirror */}
        <Text style={styles.sectionTitle}>Discover Companions</Text>
        <HomeAiModels navigation={navigation} />

        <View style={styles.separator} />

        {/* Live Stories Strip - Web Homepage Mirror */}
        <HomeLiveStories navigation={navigation} />
        
        <View style={styles.separator} />

        {/* Steps - How It Works */}
        <StepsHome />

        <View style={styles.separator} />

        {/* FAQ */}
        <HomeFAQ />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginTop: 60,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  quotaBox: {
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  quotaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quotaTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  quotaCount: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff3b30',
    borderRadius: 3,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  glowOrb: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(207, 65, 133, 0.4)',
    opacity: 0.5,
    // Add fake blur for Android since BlurView is heavy
    shadowColor: '#cf4185',
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 20,
  },
  noiseOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.1,
    backgroundColor: 'rgba(255,255,255,0.01)',
  }
});
