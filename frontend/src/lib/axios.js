import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  withCredentials: true, // Absolutely crucial for receiving and sending the HTTP-only cookie
});

export default api;
