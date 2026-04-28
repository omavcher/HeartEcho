import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert,
  Dimensions, Modal, ScrollView
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// --- PREMIUM LOCK UI ---
const PremiumLockOverlay = ({ mediaType, onUnlock }) => {
  return (
    <View style={styles.lockBackdrop}>
      <View style={styles.lockCard}>
        <View style={styles.lockIconGlow}>
          <Ionicons name="lock-closed" size={20} color="#FFD700" />
        </View>
        <Text style={styles.lockTitle}>Premium Media</Text>
        <Text style={styles.lockSub}>Subscribe to view private {mediaType}.</Text>
        <TouchableOpacity style={styles.unlockBtn} onPress={onUnlock}>
          <Ionicons name="flash" size={14} color="black" />
          <Text style={styles.unlockBtnText}>Unlock Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- MOCK VOICE CALL OVERLAY ---
const VoiceCallOverlay = ({ aiProfile, onClose, isSubscribed }) => {
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    setTimeout(() => setStatus('Listening...'), 2500);
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.callOverlay}>
        <View style={styles.callTop}>
          <View style={styles.callStatusPill}>
            <View style={styles.callDot} />
            <Text style={styles.callStatusText}>{status}</Text>
          </View>
          <Text style={styles.callTimer}>{formatTime(seconds)}</Text>
        </View>

        <View style={styles.callCenter}>
          <View style={styles.callAvatarWrap}>
            <Image 
              source={{ uri: aiProfile?.avatar_img || "https://ui-avatars.com/api/?name=AI" }} 
              style={styles.callAvatar} 
            />
          </View>
          <Text style={styles.callName}>{aiProfile?.name || 'AI Friend'}</Text>
          <Text style={styles.callNote}>Voice calling in React Native demo</Text>
        </View>

        {!isSubscribed && (
          <View style={styles.callSubscribeWrap}>
             <Text style={styles.callSubText}>Using limited daily quota</Text>
          </View>
        )}

        <View style={styles.callBottom}>
          <TouchableOpacity style={styles.hangupBtn} onPress={onClose}>
            <Ionicons name="call" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const formatTime = (timeString) => {
  try {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ""; }
};

export default function ChatBoxScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { chatId } = route.params || {};
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [aiProfile, setAiProfile] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [token, setToken] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(5);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCallOverlay, setShowCallOverlay] = useState(false);

  const flatListRef = useRef(null);

  useEffect(() => {
    initChat();
  }, [chatId]);

  const initChat = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('heartecho_token');
      setToken(storedToken);

      // Concurrent API Execution for Faster Loading with fallback handlers for outdated production servers
      const [aiRes, chatRes, quotaRes] = await Promise.all([
        axios.get(`${api.Url}/ai/detials/${chatId}`, { headers: { Authorization: `Bearer ${storedToken}` } })
          .catch(e => { console.log('AI Details fetch error:', e.message); return { data: {} }; }),
        axios.get(`${api.Url}/ai/chats/by-ai/${chatId}`, { headers: { Authorization: `Bearer ${storedToken}` } })
          .catch(e => { console.log('Chat history fetch error:', e.message); return { data: {} }; }),
        axios.get(`${api.Url}/ai/quota/status`, { headers: { Authorization: `Bearer ${storedToken}` } })
          .catch(e => { console.log('Quota fetch error:', e.message); return { data: { remainingQuota: 5, isSubscriber: false } }; })
      ]);

      setAiProfile(aiRes.data?.AiInfo || {});
      
      const msgsData = chatRes.data?.chat?.messages || [];
      setMessages(msgsData.map(m => ({
        _id: m._id,
        sender: (m.sender === "me" || m.senderModel === "User") ? "me" : "ai",
        text: m.text,
        time: m.time,
        mediaType: m.mediaType || "text",
        imgUrl: m.imgUrl,
        videoUrl: m.videoUrl,
        isRead: true,
      })));

      // Mark actual Chat doc as read
      const actualChatId = chatRes.data?.chat?._id;
      if (actualChatId) {
        axios.post(`${api.Url}/user/chats/${actualChatId}/read`, {}, {
          headers: { Authorization: `Bearer ${storedToken}` }
        }).catch(e => console.log("Mark read failed"));
      }

      setRemainingQuota(quotaRes.data?.remainingQuota ?? 5);
      setIsSubscribed(quotaRes.data?.isSubscriber || false);

    } catch (err) {
      console.log("Chat Init Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (customText = null) => {
    const text = customText || newMessage.trim();
    if (!text) return;

    if (!isSubscribed && remainingQuota <= 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const quotaExhaustedReply = {
          _id: `quota-ai-${Date.now()}`,
          sender: "ai",
          text: "Quota khatam ho gaya aaj ka, kal milte hain daddy! Premium khareed le toh raat bhar pelunga 😏",
          time: new Date().toISOString(),
          mediaType: "text",
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
      mediaType: "text",
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
        `${api.Url}/ai/${chatId}/send`, 
        { text }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.remainingQuota !== undefined) {
        setRemainingQuota(response.data.remainingQuota);
      }
      
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...m, _id: response.data?.userMessage?._id || tempId, isTemp: false, isRead: true } : m
      ));

      // After a short delay, refresh to get AI response
      setTimeout(async () => {
        const chatRes = await axios.get(`${api.Url}/ai/chats/by-ai/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const msgsData = chatRes.data?.chat?.messages || [];
        setMessages(msgsData.map(m => ({
          _id: m._id,
          sender: (m.sender === "me" || m.senderModel === "User") ? "me" : "ai",
          text: m.text,
          time: m.time,
          mediaType: m.mediaType || "text",
          imgUrl: m.imgUrl,
          videoUrl: m.videoUrl,
          isRead: true,
        })));
        setIsTyping(false);
      }, 2000);

    } catch (err) {
      console.log("Send Error:", err);
      setIsTyping(false);
      setMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === "me";
    const isMedia = item.mediaType !== 'text';

    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowAi]}>
        {!isMe && (
          <Image 
            source={{ uri: aiProfile?.avatar_img || "https://ui-avatars.com/api/?name=AI" }} 
            style={styles.msgAvatar} 
          />
        )}
        
        {isMedia ? (
          <View style={styles.mediaContainer}>
            {item.mediaType === 'video' || item.videoUrl ? (
              <Video 
                source={{ uri: item.videoUrl || item.imgUrl }}
                style={[styles.mediaContent, !isSubscribed && styles.blurred]}
                shouldPlay
                isLooping
                useNativeControls
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <Image 
                source={{ uri: item.imgUrl }} 
                style={[styles.mediaContent, !isSubscribed && styles.blurred]} 
              />
            )}
            {!isSubscribed && (
              <PremiumLockOverlay 
                mediaType={item.mediaType} 
                onUnlock={() => navigation.navigate('Subscribe')} 
              />
            )}
            <View style={styles.mediaMeta}>
              <Text style={styles.mediaTime}>{formatTime(item.time)}</Text>
            </View>
          </View>
        ) : (
          <LinearGradient
            colors={isMe ? ['#ec4899', '#be185d'] : ['#18181b', '#18181b']}
            style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleAi]}
          >
            <Text style={[styles.msgText, item.isBold && { fontWeight: '800' }]}>{item.text}</Text>
            <View style={styles.msgMeta}>
              <Text style={styles.timeText}>{formatTime(item.time)}</Text>
              {isMe && (
                <Ionicons 
                  name={item.isRead ? "checkmark-done" : "checkmark"} 
                  size={14} 
                  color={item.isRead ? "#87CEEB" : "#aaa"} 
                />
              )}
            </View>
          </LinearGradient>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#09090b' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top ? insets.top + 10 : (Platform.OS === 'ios' ? 50 : 30) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerProfile} onPress={() => setShowOverlay(true)}>
          <View style={styles.avatarRing}>
            <Image 
              source={{ uri: aiProfile?.avatar_img || "https://ui-avatars.com/api/?name=AI" }} 
              style={styles.headerAvatar} 
            />
            <View style={[styles.statusDot, isTyping ? styles.statusTyping : styles.statusOnline]} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>{aiProfile?.name || 'AI Friend'}</Text>
            <Text style={[styles.headerStatus, isTyping && styles.textHighlight]}>
              {isTyping ? "typing..." : "Online"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={styles.controlBtn} 
            onPress={() => setShowCallOverlay(true)}
          >
            <Ionicons name="call" size={20} color="#ec4899" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowOverlay(true)}>
            <Ionicons name="information-circle" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CHAT AREA */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? (
            <View style={[styles.msgRow, styles.msgRowAi]}>
              <Image source={{ uri: aiProfile?.avatar_img }} style={styles.msgAvatar} />
              <View style={[styles.bubble, styles.bubbleAi, { width: 60, alignItems: 'center' }]}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            </View>
          ) : null}
        />
      )}

      {/* INPUT AREA */}
      <View style={styles.inputArea}>
        {!isSubscribed && (
          <View style={styles.quotaBox}>
            <Text style={styles.quotaLabel}>{remainingQuota} tokens remaining</Text>
            <View style={styles.quotaTrack}>
              <View style={[styles.quotaFill, { 
                width: `${(remainingQuota/5)*100}%`, 
                backgroundColor: remainingQuota < 3 ? '#ef4444' : '#4ade80' 
              }]} />
            </View>
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => handleSendMessage("/photo Send me a photo")}
          >
            <Ionicons name="image" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => handleSendMessage("/video Send me a video")}
          >
            <Ionicons name="videocam" size={22} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={isSubscribed ? "Message..." : remainingQuota > 0 ? "Type a message..." : "Out of tokens"}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newMessage}
              onChangeText={setNewMessage}
              editable={!isTyping && (isSubscribed || remainingQuota > 0)}
              onSubmitEditing={() => handleSendMessage()}
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
              style={[styles.sendBtn, newMessage.trim() ? styles.sendActive : null]}
              onPress={() => handleSendMessage()}
              disabled={!newMessage.trim() || isTyping}
            >
              <Ionicons name="send" size={18} color={newMessage.trim() ? "#fff" : "rgba(255,255,255,0.3)"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* PROFILE OVERLAY */}
      <Modal visible={showOverlay} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
           <TouchableOpacity style={{flex: 1}} onPress={() => setShowOverlay(false)} />
           <View style={styles.modalContent}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowOverlay(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <ScrollView>
                 <View style={styles.modalPortrait}>
                    <Image source={{ uri: aiProfile?.avatar_img }} style={styles.portraitImg} />
                    <LinearGradient colors={['transparent', '#121212']} style={styles.portraitOverlay} />
                    <View style={styles.portraitText}>
                       <Text style={styles.portraitName}>{aiProfile?.name}</Text>
                       <Text style={styles.portraitRole}>{aiProfile?.relationship || aiProfile?.gender}</Text>
                    </View>
                 </View>
                 <View style={styles.profileDetails}>
                    <View style={styles.detailCard}>
                       <Text style={styles.detailLabel}>Age</Text>
                       <Text style={styles.detailValue}>{aiProfile?.age}</Text>
                    </View>
                    <View style={styles.detailCard}>
                       <Text style={styles.detailLabel}>Gender</Text>
                       <Text style={styles.detailValue}>{aiProfile?.gender}</Text>
                    </View>
                    <View style={[styles.detailCard, { width: '100%', marginTop: 12 }]}>
                       <Text style={styles.detailLabel}>Description</Text>
                       <Text style={styles.detailText}>{aiProfile?.description}</Text>
                    </View>
                 </View>
              </ScrollView>
           </View>
        </View>
      </Modal>

      {/* CALL OVERLAY */}
      {showCallOverlay && (
        <VoiceCallOverlay 
          aiProfile={aiProfile} 
          onClose={() => setShowCallOverlay(false)} 
          isSubscribed={isSubscribed}
        />
      )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b', width: width, height: height },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(9, 9, 11, 0.9)',
  },
  backBtn: { padding: 8 },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  avatarRing: { position: 'relative' },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statusDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#09090b' },
  statusOnline: { backgroundColor: '#22c55e' },
  statusTyping: { backgroundColor: '#ec4899' },
  headerInfo: { marginLeft: 10 },
  headerName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  headerStatus: { fontSize: 11, color: '#a1a1aa' },
  textHighlight: { color: '#ec4899', fontWeight: '500' },
  headerControls: { flexDirection: 'row', gap: 4 },
  controlBtn: { padding: 8 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chatList: { padding: 16, paddingBottom: 20 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end', maxWidth: '85%' },
  msgRowMe: { alignSelf: 'flex-end' },
  msgRowAi: { alignSelf: 'flex-start' },
  msgAvatar: { width: 26, height: 26, borderRadius: 13, marginRight: 8 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleAi: { borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  msgText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  msgMeta: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 4 },
  timeText: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  mediaContainer: { width: 200, aspectRatio: 3/4, borderRadius: 18, overflow: 'hidden', backgroundColor: '#18181b' },
  mediaContent: { width: '100%', height: '100%' },
  blurred: { opacity: 0.3 },
  lockBackdrop: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  lockCard: { backgroundColor: 'rgba(20,20,20,0.85)', padding: 16, borderRadius: 20, alignItems: 'center', width: '85%', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  lockIconGlow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,215,0,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  lockTitle: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  lockSub: { color: '#aaa', fontSize: 11, textAlign: 'center', marginBottom: 12 },
  unlockBtn: { backgroundColor: '#ffd700', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  unlockBtnText: { color: '#000', fontSize: 11, fontWeight: '700' },
  mediaMeta: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  mediaTime: { color: '#fff', fontSize: 10 },
  inputArea: { padding: 12, backgroundColor: 'rgba(9, 9, 11, 0.9)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  quotaBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  quotaLabel: { color: '#a1a1aa', fontSize: 11 },
  quotaTrack: { width: 100, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  quotaFill: { height: '100%', borderRadius: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 4 },
  inputWrapper: { flex: 1, backgroundColor: '#000', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
  input: { color: '#fff', fontSize: 14 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  sendActive: { backgroundColor: '#ec4899' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#121212', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: '85%' },
  modalClose: { position: 'absolute', right: 16, top: 16, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalPortrait: { width: '100%', height: 300 },
  portraitImg: { width: '100%', height: '100%' },
  portraitOverlay: { position: 'absolute', inset: 0 },
  portraitText: { position: 'absolute', bottom: 20, left: 20 },
  portraitName: { color: '#fff', fontSize: 24, fontWeight: '700' },
  portraitRole: { color: '#ec4899', fontSize: 14, fontWeight: '500', marginTop: 4 },
  profileDetails: { flexDirection: 'row', flexWrap: 'wrap', padding: 20, gap: 12 },
  detailCard: { width: '47%', padding: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  detailLabel: { fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
  detailText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 22 },
  callOverlay: { flex: 1, backgroundColor: '#09090b', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 50, justifyContent: 'space-between' },
  callTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  callStatusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  callDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80', marginRight: 8 },
  callStatusText: { color: '#4ade80', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  callTimer: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: 'bold' },
  callCenter: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  callAvatarWrap: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: 'rgba(2ec4b6, 0.3)', marginBottom: 24, overflow: 'hidden' },
  callAvatar: { width: '100%', height: '100%' },
  callName: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  callNote: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  callSubscribeWrap: { alignItems: 'center', marginBottom: 30 },
  callSubText: { color: '#ffd700', fontSize: 12, backgroundColor: 'rgba(255,215,0,0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, overflow: 'hidden' },
  callBottom: { alignItems: 'center' },
  hangupBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 }
});
