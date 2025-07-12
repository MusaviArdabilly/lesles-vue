import axios from '@/lib/axios';

export const authService = {
  // Register new user
  async register(userData) {
    try {
      const response = await axios.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login with email/password
  async login(credentials) {
    try {
      const response = await axios.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login with Google
  async loginWithGoogle(idToken) {
    try {
      const response = await axios.post('/auth/google/callback', {
        id_token: idToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      const response = await axios.post('/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  async getProfile() {
    try {
      const response = await axios.get('/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await axios.put('/me', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check email verification status
  async checkEmailVerified() {
    try {
      const response = await axios.get('/email/check-verified');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Resend email verification
  async resendEmailVerification() {
    try {
      const response = await axios.post('/email/resend');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify email
  async verifyEmail(userId, verificationHash) {
    try {
      const response = await axios.get(
        `/email/verify/${userId}/${verificationHash}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Centralized error handling
  handleError(error, defaultMessage) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return new Error(defaultMessage);
  },
};
