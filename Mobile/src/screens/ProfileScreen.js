import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image, Switch, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../config/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [twoFactor, setTwoFactor] = useState(user?.twofactor || false);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'This action is irreversible. Your account, chats, payments, and all related data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('heartecho_token');
              await axios.delete(`${api.Url}/user/delete-account`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account.');
            }
          }
        }
      ]
    );
  };

  const handleToggle2F = async () => {
    const newStatus = !twoFactor;
    setTwoFactor(newStatus);
    try {
      const token = await AsyncStorage.getItem('heartecho_token');
      await axios.post(`${api.Url}/user/twofactor`, { twofactor: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Show explicit success feedback to user
      Alert.alert('Security Updated', `Two-Factor Authentication is now ${newStatus ? 'Enabled' : 'Disabled'}.`);
    } catch (error) {
      setTwoFactor(!newStatus);
      Alert.alert('Error', 'Failed to update 2FA configuration.');
    }
  };

  const GroupTitle = ({ title }) => (
    <Text style={styles.groupTitle}>{title}</Text>
  );

  const GroupFooter = ({ text }) => (
    <Text style={styles.groupFooter}>{text}</Text>
  );

  const SettingsItem = ({ icon, label, color, screen, isLast, rightComponent }) => (
    <TouchableOpacity
      style={[styles.itemContainer, !isLast && styles.itemBorder]}
      onPress={() => screen ? navigation.navigate(screen) : null}
      activeOpacity={screen ? 0.7 : 1}
      disabled={!screen && !rightComponent}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: color }]}>
          <Ionicons name={icon} size={18} color="#fff" />
        </View>
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      {rightComponent ? rightComponent : <Ionicons name="chevron-forward" size={20} color="#666" />}
    </TouchableOpacity>
  );

  const SettingsGroup = ({ children }) => (
    <View style={styles.groupCard}>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header matching ProfileDashboard web */}
      <View style={[styles.navHeader, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.navTitle}>Profile</Text>
        {user?.user_type !== 'subscriber' && (
          <TouchableOpacity style={styles.subscribeBtn} onPress={() => navigation.navigate('Subscribe')}>
            <Ionicons name="star" size={12} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.subscribeText}>Subscribe</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Profile Hero section matching ProfileLists.jsx */}
        <View style={styles.heroSection}>
          {user?.profilePic || user?.profile_picture ? (
            <Image 
              source={{ uri: user.profilePic || user.profile_picture }} 
              style={styles.heroAvatar} 
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
          )}
          <Text style={styles.heroName}>{user?.name || 'User'}</Text>
          <Text style={styles.heroEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* DISCOVER GROUP */}
        <View style={styles.section}>
          <GroupTitle title="DISCOVER" />
          <SettingsGroup>
            <SettingsItem 
              icon="flame" 
              label="Hot Stories" 
              color="#ff3b30" 
              screen="HotStories" 
              isLast={true}
            />
          </SettingsGroup>
        </View>

        {/* ACCOUNT GROUP */}
        <View style={styles.section}>
          <GroupTitle title="ACCOUNT" />
          <SettingsGroup>
            <SettingsItem 
              icon="person" 
              label="Update Profile" 
              color="#0a84ff" 
              screen="EditProfile" 
            />
            <SettingsItem 
              icon="chatbubbles" 
              label="Chat Settings" 
              color="#34c759" 
              screen="Privacy" 
            />
            <SettingsItem 
              icon="star" 
              label="Subscription & Billing" 
              color="#ff9f0a" 
              screen="Billing" 
              isLast={true}
            />
          </SettingsGroup>
        </View>

        {/* SECURITY GROUP */}
        <View style={styles.section}>
          <GroupTitle title="SECURITY" />
          <SettingsGroup>
            <SettingsItem 
              icon="lock-closed" 
              label="Two-Factor Auth" 
              color="#af52de" 
              isLast={true}
              rightComponent={
                <Switch 
                  value={twoFactor} 
                  onValueChange={handleToggle2F} 
                  trackColor={{ false: "#39393d", true: "#34c759" }}
                  thumbColor="#fff"
                />
              }
            />
          </SettingsGroup>
          <GroupFooter text="Enable an extra layer of security on login to prevent unauthorized access." />
        </View>

        {/* SUPPORT GROUP */}
        <View style={styles.section}>
          <GroupTitle title="SUPPORT" />
          <SettingsGroup>
            <SettingsItem 
              icon="help-buoy" 
              label="Help Center / Tickets" 
              color="#0a84ff" 
              screen="Help" 
              isLast={true}
            />
          </SettingsGroup>
        </View>

        {/* DANGER ACTIONS */}
        <View style={[styles.section, { marginTop: 10 }]}>
          <SettingsGroup>
            <TouchableOpacity style={styles.dangerRow} onPress={handleLogout} disabled={loggingOut}>
              {loggingOut ? (
                <ActivityIndicator color="#ff3b30" size="small" />
              ) : (
                <Text style={styles.dangerText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </SettingsGroup>
        </View>

        <View style={styles.section}>
          <SettingsGroup>
            <TouchableOpacity style={styles.dangerRow} onPress={handleDeleteAccount}>
              <Text style={styles.dangerText}>Delete Account</Text>
            </TouchableOpacity>
          </SettingsGroup>
          <GroupFooter text="Permanently removes all your data. This cannot be undone." />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000000' 
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
    backgroundColor: '#0a0a0a',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  subscribeBtn: {
    position: 'absolute',
    right: 15,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e91e8c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subscribeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3a3a3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 14,
    color: '#8e8e93',
  },
  section: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  groupFooter: {
    fontSize: 13,
    color: '#8e8e93',
    marginHorizontal: 16,
    marginTop: 8,
  },
  groupCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1c1c1e',
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a3a3c',
    marginLeft: 16,
    paddingLeft: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemLabel: {
    fontSize: 17,
    color: '#ffffff',
  },
  dangerRow: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  dangerText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#ff3b30',
  },
});
