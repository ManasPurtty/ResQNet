import { authService } from './authService';

const API_BASE_URL = 'http://localhost:5050/api/reports';

const authenticatedRequest = async (path = '', options = {}) => {
  const token = authService.getToken();
  if (!token) {
    const error = new Error('Please log in before accessing incident reports.');
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
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
    return data.incident;
  },

  async getMine() {
    const data = await authenticatedRequest('/mine');
    return data.reports || [];
  }
};
