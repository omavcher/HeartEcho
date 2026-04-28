import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      fetchData();
    });
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('heartecho_token');
      const res = await axios.get(`${api.Url}/user/get-chat-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) setUserData(res.data);
    } catch (error) {
      console.log('Error fetching chat data', error);
    } finally {
      setLoading(false);
    }
  };

  const GroupTitle = ({ title }) => <Text style={styles.groupTitle}>{title}</Text>;
  const SettingsGroup = ({ children }) => <View style={styles.card}>{children}</View>;

  if (loading || !userData) {
    return (
      <View style={styles.container}>
         <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
           <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
             <Ionicons name="chevron-back" size={24} color="#34c759" />
             <Text style={[styles.backText, { color: '#34c759' }]}>Profile</Text>
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Chat Manage</Text>
         </View>
         <ActivityIndicator style={{marginTop: 50}} color="#34c759" />
      </View>
    );
  }

  const { userType, messageQuota, totalMessagesSent, joinedAt, daysLeft } = userData;
  const isSubscriber = (messageQuota === 999 || userType === 'subscriber');
  const progressWidth = isSubscriber ? 100 : Math.min(((messageQuota || 0) / 5) * 100, 100);
  const activeDays = isSubscriber ? "Active Subscription" : "Forever (Daily)";

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#34c759" />
          <Text style={[styles.backText, { color: '#34c759' }]}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Manage</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        <GroupTitle title="ACCOUNT SUBSCRIPTION" />
        <SettingsGroup>
          <View style={[styles.itemRow, styles.borderBottom]}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#0a84ff' }]}><Ionicons name="star" size={18} color="#fff" /></View>
              <Text style={styles.itemTitle}>Current Plan</Text>
            </View>
            <Text style={styles.itemValue}>{userType}</Text>
          </View>

          <View style={[styles.itemRow, styles.borderBottom]}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#30d158' }]}><Ionicons name="calendar" size={18} color="#fff" /></View>
              <Text style={styles.itemTitle}>Joined Date</Text>
            </View>
            <Text style={styles.itemValue}>{new Date(joinedAt).toLocaleDateString("en-GB")}</Text>
          </View>

          <View style={[styles.itemRow, styles.borderBottom]}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ff9f0a' }]}><Ionicons name="time" size={18} color="#fff" /></View>
              <Text style={styles.itemTitle}>{isSubscriber ? "Days Left" : "Access"}</Text>
            </View>
            <Text style={styles.itemValue}>{isSubscriber ? `${daysLeft} Days` : "Daily Quota"}</Text>
          </View>

          {!isSubscriber && (
            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Subscribe')}>
              <Text style={styles.actionText}>Upgrade Plan</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </SettingsGroup>

        <GroupTitle title="DAILY QUOTA" />
        <SettingsGroup>
          <View style={styles.quotaHeader}>
            <Text style={styles.itemTitle}>Messages Used</Text>
            <Text style={styles.itemValue}>{isSubscriber ? "Unlimited" : `${messageQuota || 0} / 5`}</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBG, isSubscriber && styles.progressPremiumBG]}>
               <View style={[styles.progressFill, { width: `${progressWidth}%` }, isSubscriber && styles.progressPremiumFill]} />
            </View>
          </View>
          <Text style={styles.groupFooterInline}>
            {isSubscriber ? "You are a Premium Member enjoying unlimited messages." : "Your free messages reset daily. Upgrade for unlimited messaging without boundaries."}
          </Text>
        </SettingsGroup>

        <GroupTitle title="USAGE INSIGHTS" />
        <SettingsGroup>
          <View style={[styles.itemRow, styles.borderBottom]}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#5e5ce6' }]}><Ionicons name="send" size={16} color="#fff" style={{marginLeft: 2}} /></View>
              <Text style={styles.itemTitle}>Total Messages Sent</Text>
            </View>
            <Text style={styles.itemValue}>{totalMessagesSent}</Text>
          </View>

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ff375f' }]}><Ionicons name="flame" size={18} color="#fff" /></View>
              <Text style={styles.itemTitle}>Active Days</Text>
            </View>
            <Text style={styles.itemValue}>{activeDays}</Text>
          </View>
        </SettingsGroup>

        <View style={{height: 100}} />
      </ScrollView>
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
  body: { flex: 1, paddingTop: 10 },
  groupTitle: { fontSize: 13, color: '#8e8e93', marginLeft: 16, marginTop: 24, marginBottom: 8, textTransform: 'uppercase' },
  card: { backgroundColor: '#1c1c1e', borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  borderBottom: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#3a3a3c' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 30, height: 30, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemTitle: { color: '#fff', fontSize: 17 },
  itemValue: { color: '#8e8e93', fontSize: 17 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  actionText: { color: '#0a84ff', fontSize: 17 },
  quotaHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  progressBarContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  progressBarBG: { height: 8, backgroundColor: '#3a3a3c', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0a84ff', borderRadius: 4 },
  progressPremiumBG: { backgroundColor: 'rgba(255,215,0,0.2)' },
  progressPremiumFill: { backgroundColor: '#ffd700' },
  groupFooterInline: { fontSize: 13, color: '#8e8e93', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
});
