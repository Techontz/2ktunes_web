/// <reference types="vite/client" />
import axios from 'axios';

/**
 * Custom Axios instance for Laravel Backend
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding Auth Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login or clear storage)
      localStorage.removeItem('auth_token');
      // window.location.href = '/auth'; 
    }
    return Promise.reject(error);
  }
);

export default api;
