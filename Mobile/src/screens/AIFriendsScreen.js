import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TouchableOpacity, ActivityIndicator, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import api from '../config/api';
import HomeCosAi from '../components/HomeCosAi';

export default function AIFriendsScreen({ navigation }) {
  const [aiModels, setAiModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const { data } = await axios.get(`${api.Url}/user/get-pre-ai`);
      const list = data?.data || [];
      setAiModels(list);
      setFilteredModels(list);
    } catch (err) {
      console.log("Error fetching data:", err);
      setError("Failed to load AI models. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = aiModels;
    if (activeTab !== "all") {
      filtered = filtered.filter(model => model.gender === activeTab);
    }
    setFilteredModels(filtered);
  }, [activeTab, aiModels]);

  const getShortDescription = (desc) => {
    if (!desc) return '';
    const words = desc.split(" ");
    return words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");
  };

  const renderFilterMenu = () => (
    <View style={styles.filterMenu}>
      {['all', 'female', 'male'].map(gender => (
        <TouchableOpacity
          key={gender}
          style={[styles.filterBtn, activeTab === gender && styles.filterBtnActive]}
          onPress={() => setActiveTab(gender)}
        >
          <Text style={[styles.filterBtnText, activeTab === gender && styles.filterBtnTextActive]}>
            {gender.charAt(0).toUpperCase() + gender.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHeader = () => (
    <View>
      <HomeCosAi />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Meet Your AI Companions</Text>
        <Text style={styles.subTitle}>Discover amazing AI personalities ready to chat with you</Text>
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterToggleContainer}>
        <TouchableOpacity 
          style={styles.filterToggleBtn}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={16} color="#fff" />
          <Text style={styles.filterToggleText}>{showFilters ? 'Hide Filters' : 'Show Filters'}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Menu */}
      {showFilters && renderFilterMenu()}

      {/* Error Output */}
      {error !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  const renderModel = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ChatBox', { chatId: item._id, chatName: item.name })}
    >
      <Image 
        source={{ uri: item.avatar_img || `https://ui-avatars.com/api/?name=${item.name}` }} 
        style={styles.cardImage} 
      />
      
      {/* Badges */}
      <View style={styles.ageBadge}>
        <Text style={styles.badgeText}>{item.age}</Text>
      </View>
      <View style={styles.genderBadge}>
        <Text style={styles.badgeText}>{item.gender === 'female' ? '♀' : '♂'}</Text>
      </View>

      {/* Bottom Content overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.92)']}
        style={styles.cardOverlay}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <View style={styles.relationshipBadge}>
              <Text style={styles.relationshipText}>{item.relationship || 'Friend'}</Text>
            </View>
          </View>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {getShortDescription(item.description)}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ce4085" />
        </View>
      ) : (
        <FlatList
          data={filteredModels}
          keyExtractor={(item) => (item._id ? item._id.toString() : item.id?.toString() || Math.random().toString())}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          renderItem={renderModel}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No matches found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your filters to discover more AI companions</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  filterToggleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14,14,14,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    gap: 8,
  },
  filterToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  filterBtnActive: {
    backgroundColor: '#ce4085',
    borderColor: '#ce4085',
  },
  filterBtnText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  errorBox: {
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderColor: 'rgba(255,107,107,0.25)',
    borderWidth: 1,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 14,
  },
  card: {
    width: '48%',
    aspectRatio: 9/16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  ageBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  genderBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '55%',
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: 13,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
    gap: 6,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  relationshipBadge: {
    backgroundColor: 'rgba(206,64,133,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  relationshipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    lineHeight: 16,
  },
  emptyBox: {
    paddingTop: 50,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  }
});
