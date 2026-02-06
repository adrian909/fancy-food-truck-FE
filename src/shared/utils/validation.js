/**
 * Password and input validation utilities
 */

/**
 * Password validation rules
 */
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < PASSWORD_RULES.minLength) {
    errors.push(`Parola trebuie să aibă minimum ${PASSWORD_RULES.minLength} caractere`);
  }
  
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin o literă mare');
  }
  
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin o literă mică');
  }
  
  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin o cifră');
  }
  
  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin un caracter special (!@#$%^&*...)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get password strength level
 * @param {string} password
 * @returns {string} - 'weak', 'medium', 'strong'
 */
export const getPasswordStrength = (password) => {
  if (!password) return 'weak';
  
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Romanian format)
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+40|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Validate name (no special characters, only letters and spaces)
 * @param {string} name
 * @returns {boolean}
 */
export const validateName = (name) => {
  const nameRegex = /^[a-zA-ZăâîșțĂÂÎȘȚ\s'-]+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
};
