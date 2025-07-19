import axios from '@/lib/axios';

export const classService = {
  // Create class
  async createClass(payload) {
    try {
      const response = await axios.post('/class', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
