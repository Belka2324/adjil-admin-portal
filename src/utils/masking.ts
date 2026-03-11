/**
 * Data Masking Utilities for Sensitive Information
 */

/**
 * Mask credit card number - show first 6 and last 4 digits
 */
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 10) return '****';
  const cleaned = cardNumber.replace(/\s+/g, '');
  const first6 = cleaned.substring(0, 6);
  const last4 = cleaned.substring(cleaned.length - 4);
  const masked = '*'.repeat(cleaned.length - 10);
  return `${first6}${masked}${last4}`;
};

/**
 * Mask email - show first character and domain
 */
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!localPart) return '***@***';
  const masked = `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
  return masked;
};

/**
 * Mask phone number - show first 3 and last 2 digits
 */
export const maskPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length < 5) return '****';
  const first3 = cleaned.substring(0, 3);
  const last2 = cleaned.substring(cleaned.length - 2);
  const masked = '*'.repeat(cleaned.length - 5);
  return `${first3}${masked}${last2}`;
};

/**
 * Mask document ID - show first 4 and last 4 characters
 */
export const maskDocumentId = (documentId: string): string => {
  if (documentId.length < 8) return '*'.repeat(documentId.length);
  const first4 = documentId.substring(0, 4);
  const last4 = documentId.substring(documentId.length - 4);
  const masked = '*'.repeat(documentId.length - 8);
  return `${first4}${masked}${last4}`;
};

/**
 * Mask IBAN - show first 4 and last 4 characters
 */
export const maskIBAN = (iban: string): string => {
  const cleaned = iban.replace(/\s+/g, '');
  if (cleaned.length < 8) return '*'.repeat(cleaned.length);
  const first4 = cleaned.substring(0, 4);
  const last4 = cleaned.substring(cleaned.length - 4);
  const masked = '*'.repeat(cleaned.length - 8);
  return `${first4}${masked}${last4}`;
};

/**
 * Get last 4 digits of credit card
 */
export const getLastFourCardDigits = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.substring(cleaned.length - 4) || '****';
};
