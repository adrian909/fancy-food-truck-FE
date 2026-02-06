/**
 * Security utilities for input sanitization and protection
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitize input for SQL-like injections
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export const sanitizeSQL = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove common SQL injection patterns
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
    .trim();
};

/**
 * Validate and sanitize email address
 * @param {string} email - Email address
 * @returns {string|null} - Sanitized email or null if invalid
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return null;
  
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(trimmed)) return null;
  
  return trimmed;
};

/**
 * Sanitize phone number
 * @param {string} phone - Phone number
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return '';
  
  // Keep only digits, +, -, (, ), and spaces
  return phone.replace(/[^\d\s+()-]/g, '').trim();
};

/**
 * Sanitize address to prevent script injection
 * @param {string} address - Address string
 * @returns {string} - Sanitized address
 */
export const sanitizeAddress = (address) => {
  if (typeof address !== 'string') return '';
  
  // Remove script tags and dangerous characters
  return address
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Sanitize general text input
 * @param {string} input - Text input
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (input, maxLength = 500) => {
  if (typeof input !== 'string') return '';
  
  return sanitizeHTML(input).slice(0, maxLength).trim();
};

/**
 * Sanitize numeric input
 * @param {any} input - Numeric input
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number|null} - Sanitized number or null if invalid
 */
export const sanitizeNumber = (input, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const num = Number(input);
  
  if (isNaN(num)) return null;
  if (num < min) return min;
  if (num > max) return max;
  
  return num;
};

/**
 * Generate CSRF token
 * @returns {string} - Random CSRF token
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store CSRF token in sessionStorage
 * @param {string} token - CSRF token
 */
export const storeCSRFToken = (token) => {
  sessionStorage.setItem('csrf_token', token);
};

/**
 * Get CSRF token from sessionStorage
 * @returns {string|null} - CSRF token or null
 */
export const getCSRFToken = () => {
  return sessionStorage.getItem('csrf_token');
};

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} - True if valid
 */
export const validateCSRFToken = (token) => {
  const storedToken = getCSRFToken();
  return storedToken === token && token !== null;
};

/**
 * Rate limiting helper - track requests
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if request is allowed
   * @returns {boolean} - True if allowed
   */
  isAllowed() {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  /**
   * Get remaining requests
   * @returns {number} - Number of remaining requests
   */
  getRemaining() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

// Export singleton instance for API calls
export const apiRateLimiter = new RateLimiter(30, 60000); // 30 requests per minute

/**
 * Validate URL to prevent open redirect vulnerabilities
 * @param {string} url - URL to validate
 * @param {string[]} allowedDomains - List of allowed domains
 * @returns {boolean} - True if safe
 */
export const isSafeURL = (url, allowedDomains = ['fancytruck.ro', 'backend.trifadrian.ro']) => {
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname.endsWith(domain));
  } catch {
    return false;
  }
};
