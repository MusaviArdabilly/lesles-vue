import axios from '@/lib/axios';

export const userService = {
  // Check if a user exists by email
  async checkUserByEmail(email) {
    try {
      const response = await axios.get('/users/check-email', {
        params: { email },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
