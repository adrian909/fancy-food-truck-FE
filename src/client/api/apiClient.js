import { getAuthHeaders, logout } from "../../shared/utils/auth";
import { apiRateLimiter } from "../../shared/utils/security";

const BACKEND_URL = import.meta.env.DEV ? 'http://localhost:5000' : 'https://backend.trifadrian.ro';

/**
 * Fetch helper with full security integration
 */
export const apiCall = async (endpoint, options = {}) => {
  // Check rate limit
  if (!apiRateLimiter.isAllowed()) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }

  const url = `${BACKEND_URL}${endpoint}`;
  
  // Get auth headers (includes JWT and CSRF)
  const authHeaders = await getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include cookies for CSRF
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    logout();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw new Error('Authentication required. Please login again.');
  }

  // Handle 403 Forbidden - no permission
  if (response.status === 403) {
    throw new Error('You do not have permission to perform this action.');
  }

  // Handle 429 Too Many Requests
  if (response.status === 429) {
    throw new Error('Too many requests. Please wait and try again.');
  }

  return response;
};

/**
 * GET request
 */
export const apiGet = async (endpoint) => {
  const response = await apiCall(endpoint, { method: "GET" });
  if (!response.ok) {
    throw new Error(`API GET failed: ${response.statusText}`);
  }
  return response.json();
};

/**
 * POST request
 */
export const apiPost = async (endpoint, data) => {
  const response = await apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`API POST ${endpoint} failed: ${response.status} ${response.statusText} — ${body}`);
  }
  return response.json();
};

/**
 * PUT request
 */
export const apiPut = async (endpoint, data) => {
  const response = await apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`API PUT failed: ${response.statusText}`);
  }
  return response.json();
};

/**
 * DELETE request
 */
export const apiDelete = async (endpoint) => {
  const response = await apiCall(endpoint, { method: "DELETE" });
  if (!response.ok) {
    throw new Error(`API DELETE failed: ${response.statusText}`);
  }
  return response.json();
};
