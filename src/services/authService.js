/**
 * ResQNet Client Authentication Service
 * Handles communication with MongoDB / Express backend authentication API
 */
import { API_BASE_URL } from '../config/api';

const AUTH_API_URL = `${API_BASE_URL}/auth`;

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
      const response = await fetch(`${AUTH_API_URL}/login`, {
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
      const response = await fetch(`${AUTH_API_URL}/register`, {
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
      const response = await fetch(`${AUTH_API_URL}/me`, {
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

  // Opt in to geo-targeted emergency alerts using the browser's current location.
  async updateLocation(location) {
    const token = this.getToken();
    if (!token) throw new Error('Please log in to enable nearby emergency alerts.');

    const response = await fetch(`${AUTH_API_URL}/location`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(location)
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || 'Unable to save your alert location');
      error.status = response.status;
      throw error;
    }

    const currentUser = this.getUser();
    if (currentUser) {
      this.setSession(token, {
        ...currentUser,
        lastKnownLocation: data.location,
        notificationPreferences: data.notificationPreferences || currentUser.notificationPreferences
      });
    }
    return data;
  },

  // Check backend and database connection status
  async getDbStatus() {
    try {
      const res = await fetch(`${AUTH_API_URL}/status`);
      return await res.json();
    } catch {
      return { status: 'OFFLINE', dbEngine: 'In-Memory fallback' };
    }
  }
};
