import DOMPurify from 'dompurify';

/**
 * Sanitizes input data to prevent XSS and other injection attacks.
 */
export const sanitizeInput = (data: string): string => {
  return DOMPurify.sanitize(data);
};

/**
 * Validates and cleans object properties.
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    }
  }
  return sanitized;
};
