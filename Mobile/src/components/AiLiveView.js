import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import api from '../config/api';

export default function AiLiveView({ navigation }) {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const { data } = await axios.get(`${api.Url}/ai-live`);
        if (data.success) {
          setInfluencers(data.data.filter(inf => inf.isActive !== false));
        }
      } catch (error) {
        console.log('Error fetching AI Live:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#e91e8c" size="small" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (influencers.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.dot} />
        <Text style={styles.title}>
          AI Live <Text style={styles.highlight}>Studio</Text>
        </Text>
        <View style={styles.betaBadge}>
          <Text style={styles.betaText}>BETA</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{influencers.length} LIVE</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Your AI companions are live — tap to interact</Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {influencers.map((model, index) => (
          <TouchableOpacity 
            key={model._id || index} 
            style={styles.circleItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ChatBox', { chatId: model._id })} // Redirect to live studio chat
          >
            <LinearGradient
              colors={['#ff3b30', '#ff9500', '#cf4185', '#5e17eb']}
              style={styles.ring}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.ringInner}>
                <Image 
                  source={{ uri: model.avatar || `https://ui-avatars.com/api/?name=${model.name}&background=cf4185&color=fff` }} 
                  style={styles.avatarImg} 
                />
              </View>
            </LinearGradient>

            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>{model.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  highlight: {
    color: '#cf4185',
  },
  betaBadge: {
    backgroundColor: 'rgba(255, 214, 10, 0.12)',
    borderColor: 'rgba(255, 214, 10, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  betaText: {
    color: '#ffd60a',
    fontSize: 9,
    fontWeight: 'bold',
  },
  countBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderColor: 'rgba(255,59,48,0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    color: '#ff3b30',
    fontSize: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  circleItem: {
    alignItems: 'center',
    width: 80,
  },
  ring: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
    borderRadius: 40,
    padding: 2.5,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: -8,
    shadowColor: '#ff3b30',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  liveDot: {
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  name: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  }
});
