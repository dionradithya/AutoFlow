import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');

// Cars
export const getCars = (params = {}) => api.get('/mobils', { params });
export const getCarById = (id) => api.get(`/mobils/${id}`);
export const createCar = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === 'gambar' && data[key]) {
      formData.append(key, data[key], data[key].name);
    } else {
      formData.append(key, data[key]);
    }
  });
  return api.post('/mobils', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateCar = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === 'gambar' && data[key]) {
      formData.append(key, data[key], data[key].name);
    } else if (data[key]) {
      formData.append(key, data[key]);
    }
  });
  return api.put(`/mobils/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteCar = (id) => api.delete(`/mobils/${id}`);

// Transactions
export const buyCar = (data) => api.post('/transaksi/beli', data);
export const getTransactionHistory = () => api.get('/transaksi/riwayat');

export default api;