import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import api from '../config/api';

export default function HomeLiveStories({ navigation }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await axios.get(`${api.Url}/live-story/stories`);
        if (data.success) {
          setStories(data.stories);
        }
      } catch (error) {
        console.log('Error fetching live stories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="flame" size={12} color="#b862ff" />
          <Text style={styles.badgeText}>TRENDING</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Live A <Text style={styles.titleHighlight}>Story</Text></Text>
          <TouchableOpacity onPress={() => navigation.navigate('Stories')} style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>View All</Text>
            <Ionicons name="chevron-forward" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.desc}>Experience stories through live chats. Witness the drama unfold.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#b862ff" size="large" style={{ margin: 40 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {stories.map((story) => (
            <TouchableOpacity 
              key={story._id || story.slug} 
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('LiveStoryChat', { storySlug: story.slug })}
            >
              <Image source={{ uri: story.poster }} style={styles.cardImg} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.overlay} />
              
              <View style={styles.content}>
                <Text style={styles.cat}>{story.category}</Text>
                <Text style={styles.cardTitle} numberOfLines={2}>{story.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{story.description}</Text>
                
                <View style={styles.footer}>
                  <Ionicons name="flame" size={12} color="#aaa" />
                  <Text style={styles.views}>{story.views} views</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(144, 19, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(144, 19, 254, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  badgeText: {
    color: '#b862ff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  titleHighlight: {
    color: '#ff85c2',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  desc: {
    color: '#777',
    fontSize: 13,
    lineHeight: 18,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: 240,
    height: 426, // 9:16 aspect ratio
    backgroundColor: '#111',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0, height: '60%',
  },
  content: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20,
  },
  cat: {
    color: '#b862ff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingTop: 10,
    gap: 6,
  },
  views: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '600',
  }
});
