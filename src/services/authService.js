/**
 * ResQNet Client Authentication Service
 * Handles communication with MongoDB / Express backend authentication API
 */

const API_BASE_URL = 'http://localhost:5050/api/auth';

export const authService = {
  // Store authentication token and user data in localStorage
  setSession(token, user) {
    if (token) localStorage.setItem('resqnet_token', token);
    if (user) localStorage.setItem('resqnet_user', JSON.stringify(user));
  },

  // Clear session on logout
  clearSession() {
    localStorage.removeItem('resqnet_token');
    localStorage.removeItem('resqnet_user');
  },

  // Get current auth token
  getToken() {
    return localStorage.getItem('resqnet_token');
  },

  // Get current user from storage
  getUser() {
    try {
      const user = localStorage.getItem('resqnet_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // Authenticate (Login) user or admin
  async login(email, password, role = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.setSession(data.token, data.user);
      return data;
    } catch (err) {
      console.error('Login service error:', err);
      throw err;
    }
  },

  // Register new account (Citizen or Authority)
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      this.setSession(data.token, data.user);
      return data;
    } catch (err) {
      console.error('Registration service error:', err);
      throw err;
    }
  },

  // Get authenticated user profile from backend
  async getProfile() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        this.clearSession();
        return null;
      }

      const data = await response.json();
      if (data.user) {
        localStorage.setItem('resqnet_user', JSON.stringify(data.user));
      }
      return data.user;
    } catch (err) {
      console.error('Get profile error:', err);
      this.clearSession();
      return null;
    }
  },

  // Check backend and database connection status
  async getDbStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/status`);
      return await res.json();
    } catch {
      return { status: 'OFFLINE', dbEngine: 'In-Memory fallback' };
    }
  }
};
