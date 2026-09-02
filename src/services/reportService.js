import { authService } from './authService';
import { API_BASE_URL } from '../config/api';

const REPORTS_API_URL = `${API_BASE_URL}/reports`;

const authenticatedRequest = async (path = '', options = {}) => {
  const token = authService.getToken();
  if (!token) {
    const error = new Error('Please log in before accessing incident reports.');
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${REPORTS_API_URL}${path}`, {
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
    const error = new Error(data.message || 'Incident report request failed');
    error.status = response.status;
    throw error;
  }

  return data;
};

export const reportService = {
  async create(reportData) {
    const data = await authenticatedRequest('', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
    return {
      ...data.incident,
      fusion: data.fusion,
      communityWarning: data.communityWarning
    };
  },

  async getMine() {
    const data = await authenticatedRequest('/mine');
    return data.reports || [];
  },

  async getIncidentClusters() {
    const data = await authenticatedRequest('/clusters');
    return data.incidents || [];
  },

  async updateResponderStatus(clusterId, update) {
    const data = await authenticatedRequest(`/clusters/${encodeURIComponent(clusterId)}/response`, {
      method: 'PATCH',
      body: JSON.stringify(update)
    });
    return data.incident;
  }
};
