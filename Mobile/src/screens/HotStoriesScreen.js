import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, InteractionManager, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../config/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HotStoriesScreen({ navigation }) {
  const [stories, setStories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      fetchStories();
    });
  }, []);

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${api.Url}/story`);
      if (res.data && res.data.data) {
        setStories(res.data.data);
      } else if (Array.isArray(res.data)) {
        setStories(res.data);
      }
    } catch (error) {
      console.log('Error fetching hot stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = stories.filter(s => 
    !searchQuery || 
    (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.characterName && s.characterName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderStory = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('StoryPage', { story: item, allStories: stories })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.backgroundImage }} 
          style={styles.thumbnail} 
        />
        <View style={styles.badgeOverlay}>
          {item.readCount > 100 && (
            <View style={styles.trendingBadge}>
              <Ionicons name="flame" size={12} color="#fff" />
              <Text style={styles.badgeText}>Trending</Text>
            </View>
          )}
          {item.city ? (
            <View style={styles.cityBadge}>
              <Ionicons name="location" size={12} color="#fff" />
              <Text style={styles.badgeText}>{item.city}</Text>
            </View>
          ) : null}
        </View>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{item.category || 'Romance'}</Text>
          <Text style={styles.reads}>{item.readCount || 0}K views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#ff3b30" />
          <Text style={[styles.backText, { color: '#ff3b30' }]}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hot Stories</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search characters or titles..."
            placeholderTextColor="#8e8e93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color="#ff3b30" />
      ) : (
        <FlatList
          data={filteredStories}
          keyExtractor={(item) => item._id || item.slug || Math.random().toString()}
          renderItem={renderStory}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No stories found matching your search.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
    backgroundColor: '#0a0a0a',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', position: 'absolute', left: 10, bottom: 12, zIndex: 10 },
  backText: { fontSize: 17 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, color: '#fff', fontWeight: '600' },
  searchContainer: { padding: 16, backgroundColor: '#000000' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, height: '100%' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: '#1c1c1e', borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  imageContainer: { width: '100%', aspectRatio: 16 / 9, position: 'relative' },
  thumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  badgeOverlay: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 8 },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff3b30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  cityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  cardInfo: { padding: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { color: '#ff3b30', fontSize: 13, fontWeight: '600' },
  reads: { color: '#8e8e93', fontSize: 13 },
  emptyText: { color: '#8e8e93', textAlign: 'center', marginTop: 40, fontSize: 15 }
});
