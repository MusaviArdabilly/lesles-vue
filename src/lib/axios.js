import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const token = localStorage.getItem('token');
if (token) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    const expiresIn = decoded.exp - now;

    if (expiresIn > 0) {
      setTimeout(() => {
        localStorage.removeItem('token');
        router.push({ name: 'login' });
        // Optionally show toast: "Session expired"
      }, expiresIn * 1000);
    } else {
      // Token already expired
      localStorage.removeItem('token');
      router.push({ name: 'login' });
    }
  } catch (e) {
    console.error('Invalid token');
    localStorage.removeItem('token');
    router.push({ name: 'login' });
  }
}

export default instance;
