import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Missing fields', 'Please enter your email and password.');
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Failed', err?.response?.data?.message || 'Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Logo / Brand */}
          <View style={styles.brandArea}>
            <Text style={styles.logo}>💘</Text>
            <Text style={styles.appName}>HeartEcho</Text>
            <Text style={styles.tagline}>Your AI companion awaits</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#8a8a9a"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#8a8a9a"
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient colors={['#e91e8c', '#c2185b']} style={styles.loginBtnGrad}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginBtnText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLinkText}>
                Don't have an account? <Text style={styles.signupLinkBold}>Sign Up</Text>
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
  container: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, paddingVertical: 40,
  },
  brandArea: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 60 },
  appName: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1, marginTop: 8 },
  tagline: { fontSize: 14, color: '#c084fc', marginTop: 6 },
  card: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#9d9dbc', marginBottom: 28 },
  inputWrapper: { marginBottom: 18 },
  label: { color: '#c084fc', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    padding: 14, color: '#fff', fontSize: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 10 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#e91e8c', fontSize: 13 },
  loginBtn: { borderRadius: 14, overflow: 'hidden' },
  loginBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  orText: { color: '#9d9dbc', marginHorizontal: 12, fontSize: 13 },
  signupLink: { alignItems: 'center' },
  signupLinkText: { color: '#9d9dbc', fontSize: 14 },
  signupLinkBold: { color: '#e91e8c', fontWeight: '700' },
});
