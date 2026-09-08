const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('geoattend_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // One-time System Configuration
  config: {
    async getStatus() {
      const res = await fetch(`${API_BASE_URL}/config/status`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch config status');
      return data;
    },

    async setup(configData) {
      const res = await fetch(`${API_BASE_URL}/config/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Setup failed');
      return data;
    }
  },

  // Authentication
  auth: {
    async login(email, password) {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (data.token) {
        localStorage.setItem('geoattend_token', data.token);
        localStorage.setItem('geoattend_user', JSON.stringify(data.user));
      }
      return data;
    },

    async register(userData) {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      if (data.token) {
        localStorage.setItem('geoattend_token', data.token);
        localStorage.setItem('geoattend_user', JSON.stringify(data.user));
      }
      return data;
    },

    async demoLogin(role = 'organizer') {
      const res = await fetch(`${API_BASE_URL}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Demo login failed');
      if (data.token) {
        localStorage.setItem('geoattend_token', data.token);
        localStorage.setItem('geoattend_user', JSON.stringify(data.user));
      }
      return data;
    },

    async getMe() {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
      return data.user;
    },

    async getUsers(role) {
      const url = role ? `${API_BASE_URL}/auth/users?role=${role}` : `${API_BASE_URL}/auth/users`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
      return data.users || [];
    },

    logout() {
      localStorage.removeItem('geoattend_token');
      localStorage.removeItem('geoattend_user');
    },

    getCurrentUser() {
      try {
        const u = localStorage.getItem('geoattend_user');
        return u ? JSON.parse(u) : null;
      } catch {
        return null;
      }
    }
  },

  // Events API
  events: {
    async getAll(params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/events${query ? `?${query}` : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load events');
      return data.events || [];
    },

    async getById(id) {
      const res = await fetch(`${API_BASE_URL}/events/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load event');
      return data.event;
    },

    async create(eventData) {
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create event');
      return data.event;
    },

    async update(id, eventData) {
      const res = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update event');
      return data.event;
    },

    async delete(id) {
      const res = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete event');
      return data;
    },

    async regenerateQr(id) {
      const res = await fetch(`${API_BASE_URL}/events/${id}/regenerate-qr`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to refresh QR');
      return data.qrSecret;
    }
  },

  // Attendance API
  attendance: {
    async verifyAndMark({ eventId, qrData, userLat, userLng, accuracy }) {
      const res = await fetch(`${API_BASE_URL}/attendance/verify-and-mark`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ eventId, qrData, userLat, userLng, accuracy })
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.message || 'Attendance verification failed');
        err.code = data.code;
        err.details = data.details;
        throw err;
      }
      return data;
    },

    async getEventAttendance(eventId, params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/attendance/event/${eventId}${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load attendees');
      return data.records || [];
    },

    async getLiveStats(eventId) {
      const res = await fetch(`${API_BASE_URL}/attendance/live/${eventId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load live stats');
      return data;
    },

    async manualCheckin(payload) {
      const res = await fetch(`${API_BASE_URL}/attendance/manual-checkin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Manual checkin failed');
      return data.attendance;
    },

    async getMyHistory() {
      const res = await fetch(`${API_BASE_URL}/attendance/my-history`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load personal history');
      return data.records || [];
    }
  },

  // Analytics API
  analytics: {
    async getDashboardStats() {
      const res = await fetch(`${API_BASE_URL}/analytics/dashboard`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load dashboard metrics');
      return data;
    }
  },

  // Export API
  export: {
    getCsvUrl(eventId) {
      return `${API_BASE_URL}/export/csv/${eventId}`;
    },
    getExcelUrl(eventId) {
      return `${API_BASE_URL}/export/excel/${eventId}`;
    }
  },

  // AI Assistant API
  ai: {
    async chat(prompt) {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI query failed');
      return data.answer;
    },

    async generateDescription(payload) {
      const res = await fetch(`${API_BASE_URL}/ai/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'AI description generation failed');
      return data.description;
    }
  }
};
