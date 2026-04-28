import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, FlatList, InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpScreen({ navigation }) {
  const [issue, setIssue] = useState("");
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      fetchTickets();
    });
  }, []);

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem('heartecho_token');
      const response = await axios.get(`${api.Url}/user/get-tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!issue.trim()) return;
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('heartecho_token');
      const response = await axios.post(`${api.Url}/user/make-ticket`, { issue: issue.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(prev => [response.data, ...prev]);
      setIssue("");
      Alert.alert("Success", "Ticket submitted successfully!");
    } catch (error) {
      Alert.alert("Error", "Error submitting ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'resolved': return '#34c759';
      case 'in progress': return '#0a84ff';
      case 'pending': return '#ff9f0a';
      default: return '#8e8e93';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0a84ff" />
          <Text style={styles.backText}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Tickets</Text>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIconBox}>
            <Ionicons name="help-buoy" size={32} color="#fff" />
          </View>
          <Text style={styles.heroText}>Support Center</Text>
        </View>

        <Text style={styles.sectionTitle}>SUBMIT NEW TICKET</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.textArea}
            placeholder="Please describe your issue in detail..."
            placeholderTextColor="#8e8e93"
            multiline
            numberOfLines={4}
            value={issue}
            onChangeText={setIssue}
            maxLength={1000}
          />
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>We usually reply within 24 hours.</Text>
          <Text style={styles.footerText}>{issue.length}/1000</Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, !issue.trim() && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={!issue.trim() || isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Ticket</Text>}
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>YOUR TICKETS</Text>
        <View style={styles.card}>
          {isLoading ? (
            <ActivityIndicator style={{ padding: 20 }} color="#0a84ff" />
          ) : tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <View key={ticket._id || index} style={[styles.ticketRow, index !== tickets.length - 1 && styles.borderBottom]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(ticket.status) }]} />
                <View style={styles.ticketContent}>
                  <Text style={styles.ticketIssue} numberOfLines={1}>{ticket.issue}</Text>
                  <Text style={styles.ticketDate}>{new Date(ticket.createdAt || ticket.date).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getStatusColor(ticket.status) + '22' }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(ticket.status) }]}>{ticket.status || 'Pending'}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No support tickets found.</Text>
          )}
        </View>
        <View style={{ height: 100 }} />
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
  backText: { color: '#0a84ff', fontSize: 17 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, color: '#fff', fontWeight: '600' },
  body: { flex: 1 },
  hero: { alignItems: 'center', paddingVertical: 30 },
  heroIconBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#0a84ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  heroText: { color: '#8e8e93', fontSize: 15 },
  sectionTitle: { marginLeft: 16, marginBottom: 8, fontSize: 13, color: '#8e8e93' },
  card: { backgroundColor: '#1c1c1e', borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' },
  textArea: { color: '#fff', padding: 16, height: 100, textAlignVertical: 'top', fontSize: 16 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 20 },
  footerText: { color: '#8e8e93', fontSize: 12 },
  submitBtn: { backgroundColor: '#0a84ff', marginHorizontal: 16, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  borderBottom: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#3a3a3c' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  ticketContent: { flex: 1, marginRight: 10 },
  ticketIssue: { color: '#fff', fontSize: 16, marginBottom: 4 },
  ticketDate: { color: '#8e8e93', fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  emptyText: { color: '#8e8e93', padding: 16, textAlign: 'center' }
});
