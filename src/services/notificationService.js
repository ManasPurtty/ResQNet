import { authService } from './authService';
import { API_BASE_URL } from '../config/api';

const ALERTS_API_URL = `${API_BASE_URL}/community-alerts`;

const authenticatedRequest = async (path = '', options = {}) => {
  const token = authService.getToken();
  if (!token) {
    const error = new Error('Please log in to access nearby emergency alerts.');
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${ALERTS_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) authService.clearSession();
    const error = new Error(data.message || 'Emergency alert request failed');
    error.status = response.status;
    throw error;
  }
  return data;
};

export const notificationService = {
  async getNotifications(limit = 30) {
    return authenticatedRequest(`/notifications?limit=${limit}`);
  },

  async getNearby(location) {
    const query = location
      ? `?lat=${encodeURIComponent(location.lat)}&lng=${encodeURIComponent(location.lng)}`
      : '';
    const data = await authenticatedRequest(`/nearby${query}`);
    return data.alerts || [];
  },

  async markRead(notificationId) {
    const data = await authenticatedRequest(`/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'PATCH'
    });
    return data.notification;
  },

  async markAllRead() {
    return authenticatedRequest('/notifications/read-all', { method: 'PATCH' });
  },

  async publish(alertData) {
    const data = await authenticatedRequest('/publish', {
      method: 'POST',
      body: JSON.stringify(alertData)
    });
    return data;
  },

  async getAuthorityAlerts() {
    const data = await authenticatedRequest('');
    return data.alerts || [];
  }
};
