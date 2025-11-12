import axios from 'axios';

// Auto-detect API URL based on environment
const getApiBaseUrl = () => {
  // If REACT_APP_API_URL is explicitly set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // If running in production (deployed), use the same domain
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin;
  }
  
  // Default to localhost for development
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const uploadDocument = async (formData) => {
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const getDocument = async (documentId) => {
  const response = await api.get(`/documents/${documentId}`);
  return response.data;
};

export const queryDocument = async (queryData) => {
  const response = await api.post('/query', queryData);
  return response.data;
};

export const getDocumentSummary = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/summary`);
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};

export const resetSession = async () => {
  await api.post('/session/reset');
};

export const resetSessionBeacon = () => {
  const url = `${API_BASE_URL}/session/reset`;
  const body = JSON.stringify({});

  if (navigator.sendBeacon) {
    try {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    } catch (error) {
      console.error('Beacon session reset failed, falling back to fetch:', error);
    }
  }

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
    mode: 'cors',
  }).catch((error) => {
    console.error('Session reset fetch failed:', error);
  });
};

export default api;
