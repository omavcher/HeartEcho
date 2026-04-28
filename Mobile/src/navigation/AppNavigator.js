import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ChatBoxScreen from '../screens/ChatBoxScreen';
import AIFriendsScreen from '../screens/AIFriendsScreen';
import StoriesScreen from '../screens/StoriesScreen';
import LiveStoryChatScreen from '../screens/LiveStoryChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SubscribeScreen from '../screens/SubscribeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import HelpScreen from '../screens/HelpScreen';
import BillingScreen from '../screens/BillingScreen';
import HotStoriesScreen from '../screens/HotStoriesScreen';
import StoryPageScreen from '../screens/StoryPageScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tab Navigation ────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'AIFriends') iconName = focused ? 'people' : 'people-outline';
          if (route.name === 'Stories') iconName = focused ? 'play-circle' : 'play-circle-outline';
          if (route.name === 'Chats') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={24} color={focused ? '#fff' : '#888'} />;
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          elevation: 0,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AIFriends" component={AIFriendsScreen} options={{ tabBarLabel: 'Friends' }} />
      <Tab.Screen name="Stories" component={StoriesScreen} options={{ tabBarLabel: 'Live Story' }} />
      <Tab.Screen name="Chats" component={ChatsScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// ─── App Stack (after login) ──────────────────────────────────────────────────
export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="ChatBox"
        component={ChatBoxScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="LiveStoryChat"
        component={LiveStoryChatScreen}
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Subscribe"
        component={SubscribeScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ animation: 'ios_from_right' }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ animation: 'ios_from_right' }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ animation: 'ios_from_right' }} />
      <Stack.Screen name="Billing" component={BillingScreen} options={{ animation: 'ios_from_right' }} />
      <Stack.Screen name="HotStories" component={HotStoriesScreen} options={{ animation: 'ios_from_right' }} />
      <Stack.Screen name="StoryPage" component={StoryPageScreen} options={{ animation: 'ios_from_right' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f0f2a',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeTabIcon: {
    backgroundColor: 'rgba(233,30,140,0.15)',
    borderRadius: 14,
    padding: 4,
    width: 42,
    alignItems: 'center',
  },
});
