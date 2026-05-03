/**
 * Authentication utilities with JWT tokens and CSRF protection
 */

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'currentUser';
const CSRF_TOKEN_KEY = 'csrf_token';
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:5000' : 'https://backend.trifadrian.ro';

let _csrfFetchInFlight = null;

/**
 * Get CSRF token from backend
 * @returns {Promise<string>} - CSRF token
 */
export const fetchCSRFToken = async () => {
  if (_csrfFetchInFlight) return _csrfFetchInFlight;
  _csrfFetchInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/csrf-token`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch CSRF token');
      const text = await response.text();
      if (!text) throw new Error('Empty response from server');
      const data = JSON.parse(text);
      sessionStorage.setItem(CSRF_TOKEN_KEY, data.token);
      return data.token;
    } catch (error) {
      console.error('CSRF token fetch error:', error);
      return null;
    } finally {
      _csrfFetchInFlight = null;
    }
  })();
  return _csrfFetchInFlight;
};

/**
 * Get CSRF token from storage or fetch new one
 * @returns {Promise<string|null>}
 */
export const getCSRFToken = async () => {
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (!token) {
    token = await fetchCSRFToken();
  }
  return token;
};

/**
 * Store JWT token
 * @param {string} token - JWT token
 */
export const storeToken = (token) => {
  if (!token || typeof token !== 'string') {
    console.error('Invalid token, not storing:', token);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get JWT token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store user data
 * @param {Object} user - User object
 */
export const storeUser = (user) => {
  if (!user || typeof user !== 'object') {
    // Silently ignore invalid user data
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get user data
 * @returns {Object|null}
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Register new user
 * @param {Object} userData - {name, email, password}
 * @returns {Promise<Object>} - User data with token
 */
export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    let errorMessage = 'Registration failed';
    try {
      const text = await response.text();
      if (text) {
        const error = JSON.parse(text);
        errorMessage = error.message || errorMessage;
      }
    } catch (e) {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) throw new Error('Empty response from server');
  const data = JSON.parse(text);
  
  if (data.token) {
    storeToken(data.token);
    storeUser(data.user);
  }
  
  return data;
};

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} - User data with token
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    let errorMessage = 'Login failed';
    try {
      const text = await response.text();
      if (text) {
        const error = JSON.parse(text);
        errorMessage = error.message || errorMessage;
      }
    } catch (e) {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text) throw new Error('Empty response from server');
  const data = JSON.parse(text);
  
  if (data.token) {
    storeToken(data.token);
    storeUser(data.user);
  }
  
  return data;
};

/**
 * Request a password reset email
 * @param {string} email
 * @returns {Promise<Object>} - { message }
 */
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    let errorMessage = 'Password reset request failed';
    try {
      const text = await response.text();
      if (text) {
        const error = JSON.parse(text);
        errorMessage = error.message || errorMessage;
      }
    } catch (e) {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

/**
 * Reset password using a token from the email link
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<Object>} - { message }
 */
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, newPassword })
  });

  if (!response.ok) {
    let errorMessage = 'Password reset failed';
    try {
      const text = await response.text();
      if (text) {
        const error = JSON.parse(text);
        errorMessage = error.message || errorMessage;
      }
    } catch (e) {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

/**
 * Get current user from backend
 * @returns {Promise<Object>} - User data
 */
export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      // Don't automatically logout - let the app handle auth state
      return null;
    }

    const text = await response.text();
    if (!text) return null;
    
    const data = JSON.parse(text);
    storeUser(data.user);
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Logout user and clear all data
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('uiState');
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
  sessionStorage.clear();
};

/**
 * Get authorization headers
 * @returns {Object}
 */
export const getAuthHeaders = async () => {
  const token = getToken();
  const csrfToken = await getCSRFToken();
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Check if user has admin role
 * @returns {boolean}
 */
export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};
