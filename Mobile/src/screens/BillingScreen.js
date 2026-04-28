import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BillingScreen({ navigation }) {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "User", transactionId: "pay_Q2iK4rdJgcenqN0", amount: "40" });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      fetchBillingData();
    });
  }, []);

  const fetchBillingData = async () => {
    try {
      const token = await AsyncStorage.getItem('heartecho_token');
      const res = await axios.get(`${api.Url}/user/payment-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setPaymentData(res.data);
        setFormData({
          name: res.data.name || "User",
          transactionId: res.data.paymentHistory?.[0]?.transaction_id || "pay_Q2iK4rdJgcenqN0",
          amount: String(res.data.paymentHistory?.[0]?.rupees || 40)
        });
      }
    } catch (error) {
      console.log('Error fetching billing data', error);
    } finally {
      setLoading(false);
    }
  };

  const GroupTitle = ({ title }) => <Text style={styles.groupTitle}>{title}</Text>;

  const SettingsGroup = ({ children }) => <View style={styles.card}>{children}</View>;

  const SettingsItemText = ({ title, value, borderBottom = true }) => (
    <View style={[styles.itemRow, borderBottom && styles.borderBottom]}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#ff9f0a" />
          <Text style={[styles.backText, { color: '#ff9f0a' }]}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription & Billing</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color="#ff9f0a" />
      ) : (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <GroupTitle title="VERIFY TRANSACTION" />
          <SettingsGroup>
            <View style={[styles.itemRowInput, styles.borderBottom]}>
              <Text style={styles.itemTitle}>Name</Text>
              <TextInput style={styles.itemInput} value={formData.name} editable={false} />
            </View>
            <View style={[styles.itemRowInput, styles.borderBottom]}>
              <Text style={styles.itemTitle}>Txn ID</Text>
              <TextInput style={styles.itemInput} value={formData.transactionId} onChangeText={(t) => setFormData({...formData, transactionId: t})} />
            </View>
            <View style={[styles.itemRowInput, styles.borderBottom]}>
              <Text style={styles.itemTitle}>Amount</Text>
              <TextInput style={styles.itemInput} value={formData.amount} onChangeText={(t) => setFormData({...formData, amount: t})} keyboardType="numeric" />
            </View>
            <TouchableOpacity style={styles.dangerRow} onPress={() => Alert.alert("Search", "Searching records...")}>
              <Text style={[styles.dangerText, { color: '#0a84ff' }]}>Search</Text>
            </TouchableOpacity>
          </SettingsGroup>
          <Text style={styles.groupFooter}>Use the above to manually query specific payment records. Result: {paymentData ? 'Found' : 'Not Found'}.</Text>

          <GroupTitle title="PAYMENT HISTORY" />
          <SettingsGroup>
            {paymentData?.paymentHistory?.length > 0 ? (
              paymentData.paymentHistory.map((payment, i) => (
                <View key={payment._id} style={[styles.historyRow, i !== paymentData.paymentHistory.length - 1 && styles.borderBottom]}>
                  <View style={styles.historyLeft}>
                    <View style={styles.historyIconBox}>
                      <Ionicons name="cash" size={18} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.historyAmount}>₹{payment.rupees}</Text>
                      <Text style={styles.historyTxn}>{payment.transaction_id}</Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyDate}>{new Date(payment.createdAt || payment.date).toLocaleDateString()}</Text>
                    <Text style={styles.historyExp}>Exp: {new Date(payment.expiry_date).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.itemRow}>
                <Text style={[styles.itemTitle, { color: '#8e8e93' }]}>No past payments found.</Text>
              </View>
            )}
          </SettingsGroup>

          <GroupTitle title="UPCOMING PAYMENT" />
          <SettingsGroup>
            <SettingsItemText 
              title="Next Due" 
              value={paymentData?.nextSubscriptionDate ? new Date(paymentData.nextSubscriptionDate).toLocaleDateString() : "Not Subscribed"} 
            />
            <View style={styles.itemRow}>
              <Text style={styles.itemTitle}>Status</Text>
              <Text style={[styles.itemValue, { color: paymentData?.nextSubscriptionDate ? '#ff9f0a' : '#8e8e93', fontWeight: '600' }]}>
                {paymentData?.nextSubscriptionDate ? "Pending" : "Inactive"}
              </Text>
            </View>
          </SettingsGroup>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Subscribe')}>
            <Text style={styles.primaryBtnText}>
              {paymentData?.nextSubscriptionDate ? "Pay Now" : "Subscribe"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      )}
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
  groupFooter: { fontSize: 13, color: '#8e8e93', marginHorizontal: 16, marginTop: 8 },
  card: { backgroundColor: '#1c1c1e', borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  itemRowInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, paddingHorizontal: 16 },
  borderBottom: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#3a3a3c' },
  itemTitle: { color: '#fff', fontSize: 17 },
  itemValue: { color: '#8e8e93', fontSize: 17 },
  itemInput: { color: '#8e8e93', fontSize: 17, textAlign: 'right', flex: 1 },
  dangerRow: { paddingVertical: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1c1c1e' },
  dangerText: { fontSize: 17, fontWeight: '500' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  historyIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#30d158', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyAmount: { color: '#fff', fontSize: 17, fontWeight: '500' },
  historyTxn: { color: '#8e8e93', fontSize: 12, marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyDate: { color: '#8e8e93', fontSize: 15 },
  historyExp: { color: '#8e8e93', fontSize: 12, marginTop: 2 },
  primaryBtn: { backgroundColor: '#0a84ff', marginHorizontal: 16, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 30 },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
