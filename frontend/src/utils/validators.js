export const isValidEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
export const isValidPhone    = (v) => /^[6-9]\d{9}$/.test(v)
export const isValidPincode  = (v) => /^\d{6}$/.test(v)
export const isStrongPassword = (v) => v.length >= 6
