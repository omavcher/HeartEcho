import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, Share, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function StoryPageScreen({ route, navigation }) {
  const { story, allStories = [] } = route.params || {};
  const [lang, setLang] = useState('en');
  const insets = useSafeAreaInsets();

  if (!story) return null;

  const handleStartChat = () => {
    const aiId = story.characterId || story._id;
    // On Mobile, ChatBox usually expects the ID of the AI friend
    navigation.navigate('ChatBox', { chatId: aiId });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Read ${story.characterName}'s story in ${story.city}!`,
        url: 'https://heartecho.in'
      });
    } catch (error) {
      console.log('Share error', error);
    }
  };

  const images = story.imageAlbum || [];
  const content = lang === 'en' ? (story.content_en || story) : (story.content_hi || story);
  const storyText = content?.story || story.description || story.text || "";
  const cliffhanger = content?.cliffhanger || "";

  const formatMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={index} style={{ fontWeight: 'bold', color: '#fff' }}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const renderFormattedParagraph = (p, keyProps) => {
    if (p.startsWith('### ')) {
      return <Text {...keyProps} style={[styles.storyText, styles.h3]}>{formatMarkdown(p.slice(4))}</Text>;
    } else if (p.startsWith('## ')) {
      return <Text {...keyProps} style={[styles.storyText, styles.h2]}>{formatMarkdown(p.slice(3))}</Text>;
    } else if (p.startsWith('# ')) {
      return <Text {...keyProps} style={[styles.storyText, styles.h1]}>{formatMarkdown(p.slice(2))}</Text>;
    }
    return <Text {...keyProps} style={styles.storyText}>{formatMarkdown(p)}</Text>;
  };

  const renderStoryContent = () => {
    const paragraphs = storyText.split(/\n\s*\n/).filter(p => p.trim());
    const result = [];

    paragraphs.forEach((p, i) => {
      // 1. Push the text paragraph
      result.push(
        <View key={`text-${i}`} style={styles.paragraphContainer}>
          {renderFormattedParagraph(p, {})}
        </View>
      );

      // 2. Insert 9:16 Scene Images every 3 paragraphs
      if ((i + 1) % 3 === 0 && images[Math.floor(i / 3)]) {
        result.push(
          <View key={`img-${i}`} style={styles.albumImageContainer}>
            <Image source={{ uri: images[Math.floor(i / 3)] }} style={styles.albumImage} />
          </View>
        );
      }
    });

    return result;
  };

  return (
    <View style={styles.container}>
      {/* Absolute Transparent Header */}
      <View style={[styles.headerControls, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.langToggle}>
            <TouchableOpacity 
              style={[styles.langBtn, lang === 'en' && styles.langBtnActive]} 
              onPress={() => setLang('en')}
            >
              <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.langBtn, lang === 'hi' && styles.langBtnActive]} 
              onPress={() => setLang('hi')}
            >
              <Text style={[styles.langText, lang === 'hi' && styles.langTextActive]}>हि</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        
        {/* HERO */}
        <View style={styles.heroBox}>
          <Image source={{ uri: story.backgroundImage }} style={styles.heroBg} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.cityBadge}>
              <Ionicons name="location" size={12} color="#fff" />
              <Text style={styles.cityText}>{story.city}</Text>
            </View>
            <Text style={styles.heroTitle}>{story.title}</Text>
            
            <View style={styles.statsCard}>
              <Image source={{ uri: story.characterAvatar || story.backgroundImage }} style={styles.charAvatar} />
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>CHARACTER</Text>
                <Text style={styles.statValue}>{story.characterName || 'AI Friend'}</Text>
              </View>
              <TouchableOpacity style={styles.ctaBtn} onPress={handleStartChat}>
                <Text style={styles.ctaText}>Chat Now</Text>
                <Ionicons name="flash" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* STORY ARTICLE */}
        <View style={styles.articleSection}>
          {renderStoryContent()}

          {cliffhanger ? (
            <View style={styles.cliffhangerBox}>
              <Text style={styles.cliffhangerTitle}>STORY CONTINUES IN CHAT...</Text>
              <Text style={styles.storyText}>{formatMarkdown(cliffhanger)}</Text>
            </View>
          ) : null}
        </View>

        {/* RECOMMENDED GALLERY */}
        {allStories.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Recommended Stories</Text>
            <View style={styles.relatedGrid}>
              {allStories.filter(s => s._id !== story._id).slice(0, 4).map((rel) => (
                <TouchableOpacity 
                  key={rel._id} 
                  style={styles.relatedCard}
                  onPress={() => navigation.push('StoryPage', { story: rel, allStories })}
                >
                  <View style={styles.relatedImgBox}>
                    <Image source={{ uri: rel.backgroundImage }} style={styles.relatedImg} />
                  </View>
                  <Text style={styles.relatedCardTitle} numberOfLines={2}>{rel.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* STICKY CTA */}
      <View style={[styles.stickyBottom, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.stickyProfile}>
          <Image source={{ uri: story.characterAvatar || story.backgroundImage }} style={styles.stickyAvatar} />
          <View>
            <Text style={styles.stickyName}>{story.characterName}</Text>
            <Text style={styles.typingText}>● Typing...</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.ctaBtn} onPress={handleStartChat}>
          <Text style={styles.ctaText}>Chat</Text>
          <Ionicons name="flash" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  headerControls: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  iconBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  rightActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  langBtnActive: { backgroundColor: '#ff3b30' },
  langText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  langTextActive: { color: '#fff' },
  
  body: { flex: 1 },
  heroBox: {
    width: width,
    height: width * 1.2, // Tall hero
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroBg: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  heroGradient: { ...StyleSheet.absoluteFillObject, top: '50%' },
  heroContent: { padding: 16, zIndex: 10 },
  cityBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  cityText: { color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 4, textTransform: 'uppercase' },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 20, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1c1c1e',
    padding: 12, borderRadius: 16,
    borderWidth: 1, borderColor: '#333'
  },
  charAvatar: { width: 44, height: 44, borderRadius: 12, marginRight: 12 },
  statInfo: { flex: 1 },
  statLabel: { color: '#8e8e93', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#e91e8c',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  
  articleSection: { padding: 20, paddingBottom: 40 },
  paragraphContainer: { marginBottom: 24 },
  storyText: { color: '#e0e0e0', fontSize: 17, lineHeight: 28 },
  albumImageContainer: {
    width: '100%',
    aspectRatio: 9 / 16, // Tall ratio as requested
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  albumImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  cliffhangerBox: {
    marginTop: 30, padding: 20,
    backgroundColor: 'rgba(233,30,140,0.1)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(233,30,140,0.3)',
  },
  cliffhangerTitle: { color: '#e91e8c', fontSize: 12, fontWeight: '900', marginBottom: 10, alignSelf:'center' },

  relatedSection: { paddingHorizontal: 20, paddingBottom: 40 },
  relatedTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  relatedGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  relatedCard: { width: '48%', marginBottom: 16, backgroundColor: '#1c1c1e', borderRadius: 12, overflow: 'hidden' },
  relatedImgBox: { width: '100%', aspectRatio: 16/9 },
  relatedImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  relatedCardTitle: { color: '#fff', fontSize: 13, fontWeight: '600', padding: 8 },

  h1: { fontSize: 24, fontWeight: '800', color: '#fff', marginVertical: 10 },
  h2: { fontSize: 20, fontWeight: '700', color: '#fff', marginVertical: 8 },
  h3: { fontSize: 18, fontWeight: '600', color: '#fff', marginVertical: 6 },

  stickyBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.95)',
    paddingHorizontal: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#333'
  },
  stickyProfile: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stickyAvatar: { width: 36, height: 36, borderRadius: 18 },
  stickyName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  typingText: { color: '#30d158', fontSize: 11, fontWeight: '600' },
});
