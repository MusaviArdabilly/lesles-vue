import { defineStore } from 'pinia'
import axios from '@/lib/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    clearAuth() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },
    async fetchUser() {
      if (!this.token) return null;
      try {
        const res = await axios.get('/me');
        this.user = res.data.data;
        return this.user;
      } catch {
        this.clearAuth();
        return null;
      }
    },
    async login({ email, password }) {
      try {
        const res = await axios.post('/login', { email, password });
        this.setToken(res.data.token);
        await this.fetchUser();
        return this.user;
      } catch (err) {
        throw err.response?.data?.error || 'An unknown error occurred';
      }
    },
    async loginWithGoogle(idToken) {
      try {
        const res = await axios.post('/auth/google/callback', { id_token: idToken });
        const { token } = res.data;
        this.setToken(token);
        await this.fetchUser();
        return this.user;
      } catch (error) {
        console.error('Google login error:', error);
        return null;
      }
    },
    async logout() {
      try {
        await axios.post('/logout');
      } catch (err) {
        console.warn('Logout failed, but continuing');
      } finally {
        this.clearAuth();
      }
    },
  },
})
