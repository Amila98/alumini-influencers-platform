import axios from 'axios';

const API_BASE = '${import.meta.env.VITE_API_URL}';

// Store API key in localStorage (after login/generation)
const getApiKey = () => localStorage.getItem('apiKey');
const setApiKey = (key) => localStorage.setItem('apiKey', key);
const clearApiKey = () => localStorage.removeItem('apiKey');

// Axios instance with auth header
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add API key to every request
apiClient.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }
  return config;
});

// ─── Auth (uses JWT for alumni login) ────────────────────────
export const login = (email, password) => 
  axios.post(`${API_BASE}/auth/login`, { email, password });

export const register = (email, password) => 
  axios.post(`${API_BASE}/auth/register`, { email, password });

// ─── API Key Management ───────────────────────────────────────
export const generateApiKey = (jwt, name, clientType) =>
  axios.post(`${API_BASE}/keys`, 
    { name, clientType },
    { headers: { Authorization: `Bearer ${jwt}` } }
  );

// ─── Analytics Endpoints (require API key) ────────────────────
export const getSummary = (filters = {}) =>
  apiClient.get('/public/analytics/summary', { params: filters });

export const getSkillsGap = (filters = {}) =>
  apiClient.get('/public/analytics/skills-gap', { params: filters });

export const getEmploymentSectors = (filters = {}) =>
  apiClient.get('/public/analytics/employment-sectors', { params: filters });

export const getJobTitles = (filters = {}) =>
  apiClient.get('/public/analytics/job-titles', { params: filters });

export const getTopEmployers = (filters = {}) =>
  apiClient.get('/public/analytics/top-employers', { params: filters });

export const getGeographic = (filters = {}) =>
  apiClient.get('/public/analytics/geographic', { params: filters });

export const getCertTrends = (filters = {}) =>
  apiClient.get('/public/analytics/cert-trends', { params: filters });

export const getAllAlumni = (filters = {}) =>
  apiClient.get('/public/alumni', { params: filters });

export const getProgrammeComparison = (filters = {}) =>
  apiClient.get('/public/analytics/programme-comparison', { params: filters });

export const getCareerProgression = (filters = {}) =>
  apiClient.get('/public/analytics/career-progression', { params: filters });

export const getEmploymentTimeline = (filters = {}) =>
  apiClient.get('/public/analytics/employment-timeline', { params: filters });

export const getFilterOptions = () => apiClient.get('/public/analytics/filter-options');

export { getApiKey, setApiKey, clearApiKey };
