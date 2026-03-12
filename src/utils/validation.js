/**
 * Validation Utilities
 */

export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'Email is required' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  
  return { isValid: true, message: '' };
};

export const validateOTP = (otp) => {
  if (!otp) return { isValid: false, message: 'OTP is required' };
  
  if (!/^\d+$/.test(otp)) {
    return { isValid: false, message: 'OTP must contain only numbers' };
  }
  
  if (otp.length !== 6) {
    return { isValid: false, message: 'OTP must be exactly 6 digits' };
  }
  
  return { isValid: true, message: '' };
};
