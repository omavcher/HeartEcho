import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import api from '../config/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns, padding

export default function HomeAiModels({ navigation }) {
  const [activeTab, setActiveTab] = useState('girls');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const { data } = await axios.get(`${api.Url}/user/get-pre-ai`);
        setModels(data?.data || []);
      } catch (error) {
        console.log('Error fetching AI models:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const filteredModels = models.filter((m) =>
    activeTab === 'girls' ? m.gender === 'female' : m.gender === 'male'
  ).slice(0, 10); // Show max 10 on home

  const getDesc = (desc) => {
    if (!desc) return '';
    const w = desc.split(' ');
    return w.slice(0, 5).join(' ') + (w.length > 5 ? '...' : '');
  };

  return (
    <View style={styles.container}>
      {/* Toggle Buttons */}
      <View style={styles.header}>
        <View style={styles.toggleWrapper}>
          <TouchableOpacity 
            style={[styles.toggleBtn, activeTab === 'girls' && styles.activeToggle]}
            onPress={() => setActiveTab('girls')}
          >
            <Ionicons name="female" size={14} color={activeTab === 'girls' ? '#fff' : '#888'} />
            <Text style={[styles.toggleText, activeTab === 'girls' && styles.activeToggleText]}>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, activeTab === 'boys' && styles.activeToggle]}
            onPress={() => setActiveTab('boys')}
          >
            <Ionicons name="male" size={14} color={activeTab === 'boys' ? '#fff' : '#888'} />
            <Text style={[styles.toggleText, activeTab === 'boys' && styles.activeToggleText]}>Male</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#e91e8c" size="large" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.grid}>
          {filteredModels.map((item, index) => (
            <TouchableOpacity 
              key={item._id} 
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ChatBox', { chatId: item._id, chatName: item.name })}
            >
              <Image 
                source={{ uri: item.avatar_img || `https://ui-avatars.com/api/?name=${item.name}` }} 
                style={styles.cardImage} 
              />

              <View style={styles.overlayTop}>
                <View style={styles.ageGenderBadge}>
                  <Text style={styles.ageText}>{item.age} {item.gender === 'female' ? '♀' : '♂'}</Text>
                </View>
              </View>

              {index < 3 && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>{index === 0 ? '🌟 Top Choice' : '⭐ Popular'}</Text>
                </View>
              )}

              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.bottomGradient}
              >
                <Text style={styles.modelName}>{item.name}</Text>
                <Text style={styles.modelDesc}>{getDesc(item.description)}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 4,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 6,
  },
  activeToggle: {
    backgroundColor: '#cf4185',
  },
  toggleText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: cardWidth,
    height: cardWidth * 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlayTop: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  ageGenderBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ageText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(207,65,133,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  modelName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  }
});
