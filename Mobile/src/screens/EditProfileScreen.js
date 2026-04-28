import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen({ navigation }) {
  const [userData, setUserData] = useState({ name: '', phone_number: '', age: '', gender: '' });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const insets = useSafeAreaInsets();

  const interestsOpts = [
    { id: "travel", label: "Travel", icon: "airplane" },
    { id: "cinema", label: "Cinema", icon: "film" },
    { id: "music", label: "Music", icon: "musical-notes" },
    { id: "fitness", label: "Fitness", icon: "barbell" },
    { id: "tech", label: "Tech", icon: "hardware-chip" },
    { id: "gaming", label: "Gaming", icon: "game-controller" },
    { id: "cooking", label: "Cooking", icon: "restaurant" },
    { id: "sports", label: "Sports", icon: "basketball" },
    { id: "books", label: "Books", icon: "book" },
    { id: "nature", label: "Nature", icon: "leaf" },
  ];

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      fetchUserData();
    });
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('heartecho_token');
      const res = await axios.get(`${api.Url}/user/get-user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setUserData({
          name: res.data.name || '',
          phone_number: res.data.phone_number || '',
          age: res.data.age ? String(res.data.age) : '',
          gender: res.data.gender || ''
        });
        setSelectedInterests(res.data.selectedInterests || []);
        setPreviewImage(res.data.profile_picture || res.data.profilePic || null);
      }
    } catch (error) {
      console.log('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true
    });
    if (!result.canceled && result.assets[0]) {
      // Create data URI for immediate preview and upload
      const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPreviewImage(uri);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const token = await AsyncStorage.getItem('heartecho_token');
      let profileImageUrl = previewImage;

      // In a real production deployment involving expo-image-picker & Cloudinary we would upload base64 here
      if (previewImage && previewImage.startsWith('data:image')) {
        const formData = new FormData();
        formData.append("file", previewImage);
        formData.append("upload_preset", "profile_pectures");
        formData.append("cloud_name", "dx6rjowfb");
        const cloudinaryRes = await axios.post("https://api.cloudinary.com/v1_1/dx6rjowfb/image/upload", formData);
        profileImageUrl = cloudinaryRes.data.secure_url;
      }

      await axios.put(`${api.Url}/user/update-profile`, {
        ...userData,
        profile_picture: profileImageUrl,
        selectedInterests
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const toggleInterest = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const cycleGender = () => {
    const genders = ['Male', 'Female', 'Other', ''];
    const currIdx = genders.indexOf(userData.gender);
    setUserData({ ...userData, gender: genders[(currIdx + 1) % genders.length] });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0a84ff" />
          <Text style={styles.backText}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          
          {loading ? (
            <ActivityIndicator style={{ marginTop: 50 }} color="#0a84ff" />
          ) : (
            <>
              <View style={styles.heroSection}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
                  {previewImage ? (
                    <Image source={{ uri: previewImage }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}><Ionicons name="person" size={40} color="#666" /></View>
                  )}
                  <Text style={styles.editPhotoText}>Edit Photo</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
              <View style={styles.card}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={userData.name} 
                    onChangeText={t => setUserData({...userData, name: t})} 
                    placeholder="Provide your name"
                    placeholderTextColor="#666"
                  />
                </View>
                <View style={[styles.inputRow, styles.borderTop]}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={userData.phone_number} 
                    onChangeText={t => setUserData({...userData, phone_number: t})} 
                    placeholder="Enter phone"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                  />
                </View>
                <TouchableOpacity style={[styles.inputRow, styles.borderTop]} onPress={cycleGender}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <Text style={[styles.textInput, { paddingTop: 0, paddingBottom: 0 }, !userData.gender && {color: '#666'}]}>
                    {userData.gender || 'Tap to select'}
                  </Text>
                </TouchableOpacity>
                <View style={[styles.inputRow, styles.borderTop]}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={userData.age} 
                    onChangeText={t => setUserData({...userData, age: t})} 
                    placeholder="Enter age"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>INTERESTS</Text>
              <View style={styles.interestsWrapper}>
                {interestsOpts.map(interest => {
                  const isActive = selectedInterests.includes(interest.id);
                  return (
                    <TouchableOpacity 
                      key={interest.id} 
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => toggleInterest(interest.id)}
                    >
                      <Ionicons name={interest.icon} size={16} color={isActive ? "#000" : "#fff"} />
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{interest.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.footerText}>Selecting interests helps us personalize your experience.</Text>

              <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate} disabled={updating}>
                {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Update Profile</Text>}
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  backText: { color: '#0a84ff', fontSize: 17 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, color: '#fff', fontWeight: '600' },
  body: { flex: 1 },
  heroSection: { alignItems: 'center', paddingVertical: 20 },
  avatarWrap: { alignItems: 'center' },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 8 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1c1c1e', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  editPhotoText: { color: '#0a84ff', fontSize: 15, fontWeight: '500' },
  sectionTitle: { marginLeft: 16, marginBottom: 8, fontSize: 13, color: '#8e8e93' },
  card: { backgroundColor: '#1c1c1e', borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  borderTop: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#3a3a3c' },
  inputLabel: { width: 80, color: '#fff', fontSize: 17 },
  textInput: { flex: 1, color: '#8e8e93', fontSize: 17, textAlign: 'right' },
  interestsWrapper: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: '#3a3a3c' },
  chipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  chipText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  chipTextActive: { color: '#000' },
  footerText: { color: '#8e8e93', fontSize: 13, marginHorizontal: 16, marginTop: 12, marginBottom: 30 },
  submitBtn: { backgroundColor: '#0a84ff', marginHorizontal: 16, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
