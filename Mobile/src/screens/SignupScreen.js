import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSignup = async () => {
    const { name, email, password, confirmPassword } = form;
    if (!name.trim() || !email.trim() || !password.trim()) {
      return Alert.alert('Missing fields', 'Please fill in all fields.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Password Mismatch', 'Passwords do not match.');
    }
    if (password.length < 6) {
      return Alert.alert('Weak Password', 'Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim().toLowerCase(), password });
    } catch (err) {
      Alert.alert('Signup Failed', err?.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brandArea}>
            <Text style={styles.logo}>💘</Text>
            <Text style={styles.appName}>HeartEcho</Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.subtitle}>Join HeartEcho today — it's free</Text>

            {[
              { key: 'name', label: 'Full Name', placeholder: 'Your name', keyboard: 'default' },
              { key: 'email', label: 'Email', placeholder: 'you@example.com', keyboard: 'email-address' },
            ].map(({ key, label, placeholder, keyboard }) => (
              <View style={styles.inputWrapper} key={key}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor="#8a8a9a"
                  keyboardType={keyboard}
                  autoCapitalize={key === 'name' ? 'words' : 'none'}
                  value={form[key]}
                  onChangeText={v => update(key, v)}
                />
              </View>
            ))}

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Create a password"
                  placeholderTextColor="#8a8a9a"
                  secureTextEntry={!showPass}
                  value={form.password}
                  onChangeText={v => update('password', v)}
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat password"
                placeholderTextColor="#8a8a9a"
                secureTextEntry={!showPass}
                value={form.confirmPassword}
                onChangeText={v => update('confirmPassword', v)}
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <LinearGradient colors={['#e91e8c', '#c2185b']} style={styles.btnGrad}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  brandArea: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 52 },
  appName: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: 1, marginTop: 8 },
  tagline: { fontSize: 14, color: '#c084fc', marginTop: 6 },
  card: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#9d9dbc', marginBottom: 24 },
  inputWrapper: { marginBottom: 16 },
  label: { color: '#c084fc', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { color: '#9d9dbc', fontSize: 14 },
  loginLinkBold: { color: '#e91e8c', fontWeight: '700' },
});
