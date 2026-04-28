import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('heartecho_token');
      const storedUser = await AsyncStorage.getItem('heartecho_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('Auth load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE.Url}/auth/login`, { email, password });
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('heartecho_token', t);
    await AsyncStorage.setItem('heartecho_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return res.data;
  };

  const signup = async (data) => {
    const res = await axios.post(`${API_BASE.Url}/auth/register`, data);
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('heartecho_token', t);
    await AsyncStorage.setItem('heartecho_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('heartecho_token');
    await AsyncStorage.removeItem('heartecho_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('heartecho_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
