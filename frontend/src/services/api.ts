import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pharmagen_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Automatic Refresh Token Handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('pharmagen_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
          const { access_token, refresh_token } = res.data;
          
          localStorage.setItem('pharmagen_access_token', access_token);
          localStorage.setItem('pharmagen_refresh_token', refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const loginApi = async (username: string, password: str) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  const response = await axios.post('/api/v1/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const registerApi = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// Report Generation Endpoints
export const downloadPdfReport = async () => {
  const response = await api.post('/reports/pdf', { title: 'Executive Pharmaceutical R&D Synthesis Report' }, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'PharmaGen_R&D_Report.pdf');
  document.body.appendChild(link);
  link.click();
};

export const downloadExcelReport = async () => {
  const response = await api.post('/reports/excel', { title: 'Executive Pharmaceutical R&D Data' }, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'PharmaGen_R&D_Data.xlsx');
  document.body.appendChild(link);
  link.click();
};

export const downloadPptxReport = async () => {
  const response = await api.post('/reports/pptx', { title: 'Executive Pharmaceutical R&D Presentation' }, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'PharmaGen_R&D_Deck.pptx');
  document.body.appendChild(link);
  link.click();
};

// Domain APIs
export const searchPapers = async (query: string) => {
  const response = await api.post('/papers/search', { query, top_k: 5 });
  return response.data;
};

export const uploadPaper = async (formData: FormData) => {
  const response = await api.post('/papers/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const ingestCSV = async (formData: FormData) => {
  const response = await api.post('/analytics/ingest-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const runHypothesisTest = async (datasetId: string, testType: string, groupCol: string, targetCol: string) => {
  const response = await api.post('/stats/hypothesis-test', {
    dataset_id: datasetId,
    test_type: testType,
    group_column: groupCol,
    target_column: targetCol,
  });
  return response.data;
};

export const trainMLModel = async (datasetId: string, modelType: string, targetCol: string) => {
  const response = await api.post('/ml/train', {
    dataset_id: datasetId,
    model_type: modelType,
    target_column: targetCol,
    task_type: 'regression',
  });
  return response.data;
};

export const queryTextToSQL = async (prompt: string) => {
  const response = await api.post('/sql/query', { prompt });
  return response.data;
};

export const verifyCompliance = async (experimentId: string, sopCode: string) => {
  const response = await api.post('/compliance/verify', {
    experiment_id: experimentId,
    sop_code: sopCode,
  });
  return response.data;
};

export const chatWithAgents = async (prompt: string) => {
  const response = await api.post('/agents/chat', { prompt });
  return response.data;
};

export default api;
