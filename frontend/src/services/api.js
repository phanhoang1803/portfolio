// frontend/src/services/api.js
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Posts API
export const postsApi = {
  // Get all posts
  getPosts: (page = 1, pageSize = 10, tag = null, search = null) => {
    let params = { page, page_size: pageSize };
    if (tag) params.tag = tag;
    if (search) params.search = search;
    
    return api.get('/posts', { params });
  },
  
  // Get post by slug
  getPost: (slug) => api.get(`/posts/${slug}`),
  
  // Create new post
  createPost: (postData) => api.post('/posts', postData),
  
  // Update post
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  
  // Delete post
  deletePost: (id) => api.delete(`/posts/${id}`),
  
  // Upload image
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/posts/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Auth API
export const authApi = {
  // Login
  login: (username, password) => 
    api.post('/auth/login/json', { username, password }),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  
  // Initialize admin (first-time setup)
  initAdmin: () => api.post('/auth/init-admin'),
};

export default api;