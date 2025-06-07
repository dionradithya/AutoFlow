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

// ===== AUTHENTICATION ENDPOINTS =====
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');

// ===== CARS/MOBILS ENDPOINTS =====
export const getCars = (params = {}) => api.get('/mobils', { params });
export const getCarById = (id) => api.get(`/mobils/${id}`);

export const createCar = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === 'gambar' && data[key]) {
      formData.append(key, data[key], data[key].name);
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return api.post('/mobils', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateCar = (id, data) => {
  console.log('updateCar called with:', { id, data });
  
  if (data.gambar && data.gambar instanceof File) {
    const formData = new FormData();
    
    formData.append('nama', data.nama || '');
    formData.append('merk', data.merk || '');
    formData.append('amount', data.amount || '');
    formData.append('deskripsi', data.deskripsi || '');
    formData.append('gambar', data.gambar);
    formData.append('_method', 'PUT');
    
    return api.post(`/mobils/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      },
    });
  } 
  
  const jsonData = {};
  
  if (data.nama !== undefined && data.nama !== null) jsonData.nama = data.nama;
  if (data.merk !== undefined && data.merk !== null) jsonData.merk = data.merk;
  if (data.amount !== undefined && data.amount !== null) jsonData.amount = data.amount;
  if (data.deskripsi !== undefined && data.deskripsi !== null) jsonData.deskripsi = data.deskripsi;
  
  console.log('Sending JSON payload:', JSON.stringify(jsonData, null, 2));
  
  return api.put(`/mobils/${id}`, jsonData, {
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  });
};

export const deleteCar = (id) => api.delete(`/mobils/${id}`);

// ===== TRANSACTION ENDPOINTS =====
export const buyCar = (data) => api.post('/transaksi/beli', data);
export const getTransactionHistory = (params = {}) => api.get('/transaksi/riwayat', { params });

// Endpoint untuk notifikasi Midtrans (biasanya tidak dipanggil dari frontend)
// Tapi disediakan jika dibutuhkan untuk testing atau keperluan lain
export const sendMidtransNotification = (data) => api.post('/transaksi/notification', data);

// ===== UTILITY FUNCTIONS =====
// Helper function untuk membuat request dengan custom headers
export const makeRequestWithCustomHeaders = (method, url, data = null, customHeaders = {}) => {
  const config = {
    method,
    url,
    headers: {
      ...api.defaults.headers,
      ...customHeaders,
    },
  };
  
  if (data) {
    config.data = data;
  }
  
  return api(config);
};

// Helper function untuk file upload dengan progress tracking
export const uploadFileWithProgress = (url, formData, onUploadProgress) => {
  return api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

// ===== ERROR HANDLER =====
// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Return the error for handling in components
    return Promise.reject(error);
  }
);

// ===== ALTERNATIVE API FUNCTIONS =====
// Alternative functions using different approaches if needed

// Alternative car creation without FormData (JSON only)
export const createCarJSON = (data) => api.post('/mobils', data);

// Alternative car update without FormData (JSON only)  
export const updateCarJSON = (id, data) => api.put(`/mobils/${id}`, data);

// Function to get cars with specific filters
export const searchCars = (searchParams) => {
  const params = new URLSearchParams();
  Object.keys(searchParams).forEach(key => {
    if (searchParams[key]) {
      params.append(key, searchParams[key]);
    }
  });
  return api.get(`/mobils?${params.toString()}`);
};

// Function for transaction history with filters
export const getFilteredTransactionHistory = (filters = {}) => {
  return api.get('/transaksi/riwayat', { params: filters });
};

export default api;