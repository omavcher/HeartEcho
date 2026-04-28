import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, TextInput, RefreshControl,
  Platform, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ChatsScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('heartecho_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      // Use the proper web endpoint to get the conversation list
      const res = await axios.get(`${api.Url}/user/chat-friends`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      const chatData = Array.isArray(res.data) ? res.data : [];
      setChats(chatData);
    } catch (e) {
      console.log('Fetch chats error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChats();
    });
    return unsubscribe;
  }, [navigation]);

  const processedChats = useMemo(() => {
    let result = chats;
    if (searchTerm) {
      result = chats.filter(chat => 
        (chat.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chat.lastMessage || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Sort: Unread first, then Time descending
    return [...result].sort((a, b) => {
      const unreadA = (a.unreadCount > 0);
      const unreadB = (b.unreadCount > 0);
      if (unreadA && !unreadB) return -1;
      if (!unreadA && unreadB) return 1;
      const timeA = new Date(a.lastMessageTime || 0).getTime();
      const timeB = new Date(b.lastMessageTime || 0).getTime();
      return timeB - timeA;
    });
  }, [chats, searchTerm]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const now = new Date();
      const msgDate = new Date(timestamp);
      const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return msgDate.toLocaleDateString([], { weekday: 'short' });
      return msgDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    } catch (e) { return ""; }
  };

  const renderChat = ({ item }) => {
    const isUnread = item.unreadCount > 0;
    return (
      <TouchableOpacity
        style={[styles.chatRow, isUnread && styles.chatRowUnread]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ChatBox', { chatId: item._id })}
      >
        <View style={styles.avatarWrapper}>
          <Image 
            source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${item.name}` }} 
            style={styles.avatar} 
          />
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.timeText, isUnread && styles.timeTextUnread]}>
              {formatTime(item.lastMessageTime)}
            </Text>
          </View>

          <View style={styles.chatFooter}>
            <Text 
              style={[styles.lastMsg, isUnread && styles.lastMsgUnread]} 
              numberOfLines={1}
            >
              {item.lastMessage || "Started a conversation"}
            </Text>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050505', '#121212']} style={styles.topHeader}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => navigation.navigate('AIFriends')}
        >
          <Ionicons name="add-circle" size={28} color="#ec4899" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#666"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : (
        <FlatList
          data={processedChats}
          keyExtractor={item => (item.chatId || item._id).toString()}
          renderItem={renderChat}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchChats(); }} 
              tintColor="#ec4899" 
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={80} color="rgba(255,255,255,0.05)" />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySub}>Start chatting with an AI friend to see your messages here.</Text>
              <TouchableOpacity 
                style={styles.browseBtn}
                onPress={() => navigation.navigate('AIFriends')}
              >
                <LinearGradient colors={['#ec4899', '#be185d']} style={styles.browseGrad}>
                   <Text style={styles.browseText}>Browse AI Friends</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerIcon: { padding: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, marginLeft: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 100 },
  chatRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)'
  },
  chatRowUnread: { backgroundColor: 'rgba(236, 72, 153, 0.03)' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#111' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#050505'
  },
  chatContent: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  userName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  timeText: { color: '#666', fontSize: 11, fontWeight: '500' },
  timeTextUnread: { color: '#ec4899' },
  chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg: { color: '#888', fontSize: 13, flex: 1, marginRight: 10 },
  lastMsgUnread: { color: '#fff', fontWeight: '600' },
  unreadBadge: {
    backgroundColor: '#ec4899',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  emptySub: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  browseBtn: { borderRadius: 12, overflow: 'hidden' },
  browseGrad: { paddingHorizontal: 24, paddingVertical: 12 },
  browseText: { color: '#fff', fontWeight: '700', fontSize: 15 }
});
