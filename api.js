/**
 * Campus Shield - API Helper
 * Wraps all fetch calls with auth token handling
 */

const API_BASE = (window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:'))
  ? `${window.location.origin}/api`
  : 'http://localhost:5000/api';

// Get stored token
function getToken() {
  return localStorage.getItem('token');
}

// Get stored user
function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

// Save login session
function saveSession(user, token) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Clear session (logout)
function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Check if logged in
function isLoggedIn() {
  return !!getToken();
}

// Core API request
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  // Only add JSON content-type if not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  // If unauthorized, clear session and show login
  if (res.status === 401) {
    clearSession();
    if (typeof window.showLoginScreen === 'function') {
      window.showLoginScreen();
    }
  }

  return data;
}

// ============================================
// AUTH
// ============================================
const AuthAPI = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  googleLogin: (googleData) =>
    apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    }),

  me: () => apiRequest('/auth/me'),
};

// ============================================
// INCIDENTS
// ============================================
const IncidentsAPI = {
  create: (formData) =>
    apiRequest('/incidents', {
      method: 'POST',
      body: formData,
    }),

  list: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/incidents${params ? '?' + params : ''}`);
  },

  stats: () => apiRequest('/incidents/stats'),

  sos: (location) =>
    apiRequest('/incidents/sos', {
      method: 'POST',
      body: JSON.stringify({ location }),
    }),

  updateStatus: (id, status, message) =>
    apiRequest(`/incidents/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, message }),
    }),
};

// ============================================
// ALERTS
// ============================================
const AlertsAPI = {
  list: () => apiRequest('/alerts'),
  unreadCount: () => apiRequest('/alerts/unread-count'),
  markRead: (id) =>
    apiRequest(`/alerts/${id}/read`, { method: 'PUT' }),
};

// Expose globally
window.API = { AuthAPI, IncidentsAPI, AlertsAPI };
window.session = { getToken, getUser, saveSession, clearSession, isLoggedIn };