import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, ActivityIndicator, Dimensions, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import api from '../config/api';

const { width } = Dimensions.get('window');

export default function StoriesScreen({ navigation }) {
  const [allStories, setAllStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await axios.get(`${api.Url}/live-story/stories`);
      if (data.success) {
        setAllStories(data.stories);
      }
    } catch (e) {
      console.log('Error fetching stories:', e);
    } finally {
      setLoading(false);
    }
  };

  const heroStories = allStories.slice(0, 3);
  const trendingStories = [...allStories].sort((a,b) => parseFloat(b.views || 0) - parseFloat(a.views || 0)).slice(0, 10);

  const renderSectionHeader = (icon, title) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color="#b862ff" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b862ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Text style={styles.mainTitle}>Live A <Text style={styles.highlight}>Story</Text></Text>
        <Text style={styles.subtitle}>Immerse yourself in cinematic interactive chatting experiences.</Text>
      </View>

      {/* Hero Carousel */}
      {heroStories.length > 0 && (
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
        >
          {heroStories.map(story => (
            <TouchableOpacity 
              key={story._id || story.slug} 
              style={styles.heroCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('LiveStoryChat', { storySlug: story.slug })}
            >
              <Image source={{ uri: story.banner || story.poster }} style={styles.heroImg} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Trending List */}
      {trendingStories.length > 0 && (
        <View style={styles.trendingSection}>
          {renderSectionHeader("flame", "Trending Top 10")}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
            {trendingStories.map((story, idx) => (
              <TouchableOpacity 
                key={story._id || story.slug} 
                style={styles.trendCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('LiveStoryChat', { storySlug: story.slug })}
              >
                <Text style={styles.trendRank}>{idx + 1}</Text>
                <Image source={{ uri: story.poster }} style={styles.cardImg} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardOverlay}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{story.title}</Text>
                  <Text style={styles.cardCat}>{story.category}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* All Stories Grid */}
      <View style={styles.gridSection}>
        {renderSectionHeader("layers", "All Stories")}
        <View style={styles.grid}>
          {allStories.map(story => (
            <TouchableOpacity 
              key={story._id || story.slug} 
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('LiveStoryChat', { storySlug: story.slug })}
            >
              <Image source={{ uri: story.poster }} style={styles.cardImg} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.cardOverlay}>
                <Text style={styles.cardTitle} numberOfLines={2}>{story.title}</Text>
                <Text style={styles.cardCat}>{story.category}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  highlight: {
    color: '#b862ff',
  },
  subtitle: {
    color: '#a1a1aa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 10,
  },
  carousel: {
    marginBottom: 40,
  },
  heroCard: {
    width: width - 32,
    marginHorizontal: 16,
    aspectRatio: 16/9,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  heroImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  trendingSection: {
    marginBottom: 40,
  },
  trendingScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  trendCard: {
    width: 160,
    aspectRatio: 9/16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#111',
  },
  trendRank: {
    position: 'absolute',
    top: 4,
    left: 8,
    fontSize: 40,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  cardImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 12,
    height: '50%',
    justifyContent: 'flex-end',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  cardCat: {
    color: '#b862ff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  gridSection: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (width - 48) / 2, // 2 columns, padding 16px on each side + 16px in middle
    aspectRatio: 9/16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#111',
  }
});
