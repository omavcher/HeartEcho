import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, 
  Image, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function LiveStoryChatScreen({ route, navigation }) {
  const { storySlug } = route.params;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [storyDetails, setStoryDetails] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [token, setToken] = useState(null);
  const [isTyping, setIsTyping] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  
  // Quota Management
  const [isSubscribed, setIsSubscribed] = useState(false); 
  const [remainingQuota, setRemainingQuota] = useState(5); 

  const flatListRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [storySlug]);

  const loadData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('heartecho_token');
      setToken(storedToken);

      // Fetch Story Details
      const metaRes = await axios.get(`${api.Url}/live-story/stories/${storySlug}`);
      if (metaRes.data.success) {
        setStoryDetails(metaRes.data.story);
      }

      if (storedToken) {
        // Fetch Chat
        const chatRes = await axios.get(`${api.Url}/live-story/${storySlug}/chat`, { 
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        
        const chatData = chatRes.data?.chat;
        if (chatData?.messages && chatData.messages.length > 0) {
          setMessages(chatData.messages.map(formatMessageData));
        }

        // Quota
        const qs = chatRes.data?.quotaStatus;
        if (qs) {
           setRemainingQuota(qs.remainingQuota ?? 5);
           setIsSubscribed(qs.isSubscriber || false);
        }
      }
    } catch (e) {
      console.log('Story Loading Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageData = (msg) => ({
    _id: msg._id,
    sender: msg.sender === "me" ? "me" : "ai",
    text: msg.text,
    time: msg.time,
    isRead: true, 
  });

  const handleSendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;

    if (!isSubscribed && remainingQuota <= 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const quotaExhaustedReply = {
          _id: `quota-ai-${Date.now()}`,
          sender: "ai",
          text: "You have used your free daily quota of 5 messages. Please subscribe to continue this thrilling story!",
          time: new Date().toISOString(),
          isRead: true,
          isBold: true
        };
        setMessages(prev => [...prev, quotaExhaustedReply]);
      }, 1000);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const userMsg = {
      _id: tempId,
      sender: "me",
      text: text,
      time: new Date().toISOString(),
      isTemp: true,
      isRead: false
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");
    setIsTyping(true);

    if (!isSubscribed) {
      setRemainingQuota(prev => Math.max(0, prev - 1));
    }

    try {
      const response = await axios.post(
        `${api.Url}/live-story/${storySlug}/chat/send`, 
        { text }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.quotaStatus) {
        setRemainingQuota(response.data.quotaStatus.remainingQuota);
        setIsSubscribed(response.data.quotaStatus.isSubscriber);
      }
      
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...m, _id: response.data?.userMessage?._id || tempId, isTemp: false, isRead: true } : m
      ));

      if (response.data?.aiMessage) {
        setIsTyping(false);
        setMessages(prev => [...prev, formatMessageData(response.data.aiMessage)]);
      }

    } catch (error) {
      console.log("Send Error:", error);
      setIsTyping(false);
      setMessages(prev => prev.filter(m => m._id !== tempId)); 
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender === "me";
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowAi]}>
        {!isMe && (
          <Image 
            source={{ uri: storyDetails?.poster || "https://ui-avatars.com/api/?name=AI" }} 
            style={styles.avatar} 
          />
        )}
        <LinearGradient
          colors={isMe ? ['#ec4899', '#be185d'] : ['#18181b', '#18181b']}
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleAi]}
        >
          <Text style={[styles.msgText, item.isBold && { fontWeight: '800' }]}>{item.text}</Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#09090b', paddingTop: Platform.OS === 'ios' ? 40 : 25 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image 
          source={{ uri: storyDetails?.poster || "https://ui-avatars.com/api/?name=S" }} 
          style={styles.headerAvatar} 
        />
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{storyDetails?.title || 'Live Story'}</Text>
          <Text style={styles.headerStatus}>{isTyping ? 'Typing...' : 'Online'}</Text>
        </View>
      </View>

      {/* CHAT AREA */}
      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={item => item._id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: true})}
        onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyState}>
               <Image source={{uri: storyDetails?.poster}} style={{width: 120, height: 180, borderRadius: 10, marginBottom: 16}} />
               <Text style={styles.emptyTitle}>{storyDetails?.title}</Text>
               <Text style={styles.emptyDesc}>{storyDetails?.description}</Text>
               <Text style={styles.emptyHint}>* Say Hello to start the story *</Text>
            </View>
          )
        }
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.messageRow, styles.messageRowAi]}>
              <Image source={{ uri: storyDetails?.poster }} style={styles.avatar} />
              <View style={[styles.bubble, styles.bubbleAi, { paddingHorizontal: 20 }]}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            </View>
          ) : null
        }
      />

      {/* INPUT AREA */}
      <View style={styles.inputArea}>
        {!isSubscribed && (
          <View style={styles.quotaBox}>
            <Text style={styles.quotaText}>{remainingQuota} tokens remaining</Text>
            <View style={styles.quotaTrack}>
              <View style={[styles.quotaFill, { width: `${(remainingQuota/5)*100}%`, backgroundColor: remainingQuota < 3 ? '#ef4444' : '#4ade80' }]} />
            </View>
          </View>
        )}

        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={isSubscribed ? "Message..." : remainingQuota > 0 ? "Type a message..." : "Out of tokens"}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newMessage}
              onChangeText={setNewMessage}
              editable={!isTyping && (isSubscribed || remainingQuota > 0)}
              onSubmitEditing={handleSendMessage}
            />
          </View>

          {!isSubscribed && remainingQuota <= 0 ? (
            <TouchableOpacity 
              style={[styles.sendBtn, { backgroundColor: '#ffd700' }]}
              onPress={() => navigation.navigate('Subscribe')}
            >
              <Ionicons name="flash" size={20} color="#000" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.sendBtn, newMessage.trim() ? styles.sendBtnActive : null]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || isTyping}
            >
              <Ionicons name="send" size={18} color={newMessage.trim() ? "#fff" : "rgba(255,255,255,0.3)"} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(9, 9, 11, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    color: '#a1a1aa',
    fontSize: 12,
  },
  chatArea: {
    padding: 16,
    paddingBottom: 30,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    maxWidth: '85%',
  },
  messageRowMe: {
    alignSelf: 'flex-end',
  },
  messageRowAi: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  msgText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    color: '#888',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  emptyHint: {
    color: '#ce4085',
    marginTop: 12,
    fontSize: 12,
  },
  inputArea: {
    padding: 12,
    backgroundColor: 'rgba(9, 9, 11, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  quotaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  quotaText: {
    color: '#a1a1aa',
    fontSize: 11,
  },
  quotaTrack: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  quotaFill: {
    height: '100%',
    borderRadius: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#ec4899',
  }
});
