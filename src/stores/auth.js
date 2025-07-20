import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import axios from '@/lib/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
    userCacheTime: null,
    cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,

    isTokenValid: (state) => {
      if (!state.token) return false;

      const localToken = localStorage.getItem('token');
      const sessionToken = sessionStorage.getItem('token');

      return state.token === localToken || state.token === sessionToken;
    },

    isUserCacheValid: (state) => {
      return (
        state.user &&
        state.userCacheTime &&
        Date.now() - state.userCacheTime < state.cacheDuration
      );
    },
  },

  actions: {
    initializeAuth() {
      const localToken = localStorage.getItem('token');
      const sessionToken = sessionStorage.getItem('token');

      if (localToken) {
        this.token = localToken;
        this.setupAxiosAuth(localToken);
      } else if (sessionToken) {
        this.token = sessionToken;
        this.setupAxiosAuth(sessionToken);
      }
    },

    setupAxiosAuth(token) {
      // Clean, synchronous axios setup
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    setToken(token, rememberMe = true) {
      this.token = token;
      this.setupAxiosAuth(token);

      if (rememberMe) {
        localStorage.setItem('token', token);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
      }
    },

    clearAuth() {
      this.token = null;
      this.user = null;
      this.userCacheTime = null;
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');

      // Clean, synchronous axios cleanup
      delete axios.defaults.headers.common['Authorization'];
    },

    async fetchUser(useCache = true) {
      if (this.isLoading) return this.user;

      if (useCache && this.isUserCacheValid) {
        return this.user;
      }

      this.isLoading = true;

      try {
        const response = await authService.getProfile();
        this.user = response.data.user || response;
        this.userCacheTime = Date.now();
        return this.user;
      } catch (error) {
        errorHandler.log(error, 'Auth Store - Fetch User');
        if (error.response?.status === 401) {
          this.logout();
        }
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async login({ email, password, rememberMe = true }) {
      try {
        this.isLoading = true;
        const response = await authService.login({ email, password });

        const token = response.data?.token || response.token;

        if (!token) {
          throw new Error('No token received from login response');
        }

        this.setToken(token, rememberMe);
      } catch (error) {
        errorHandler.log(error, 'Auth Store - Login');
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async loginWithGoogle(idToken) {
      try {
        this.isLoading = true;
        const response = await authService.loginWithGoogle(idToken);

        const token = response.data?.token || response.token;

        if (!token) {
          throw new Error('No token received from Google login response');
        }

        this.setToken(token, true);
      } catch (error) {
        errorHandler.log(error, 'Auth Store - Google Login');
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        if (this.token) {
          await authService.logout();
        }
      } catch (error) {
        errorHandler.log(error, 'Auth Store - Logout', 'warn');
      } finally {
        this.clearAuth();
      }
    },

    updateUserLocally(userData) {
      this.user = { ...this.user, ...userData };
      this.userCacheTime = Date.now();
    },

    async refreshUser() {
      return await this.fetchUser(false);
    },

    getLoginRedirectRoute() {
      if (!this.user) return '/login';

      if (!this.user.email_verified_at) {
        return '/verify-email';
      }

      if (Number(this.user.profile_complete) === 0) {
        if (this.user.role === 'guru') {
          return '/complete-teacher-profile';
        }
        if (this.user.role === 'murid') {
          return '/complete-student-profile';
        }
      }

      const roleRoutes = {
        admin: '/admin/dashboard',
        operator: '/operator',
        guru: '/class',
        murid: '/class',
      };

      return roleRoutes[this.user.role] || '/class';
    },
  },
});
