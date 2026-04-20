import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeObject } from '../services/security';

describe('Security Module - Input Sanitization', () => {
  it('removes XSS script tags from user input', () => {
    const malicious = '<script>alert("xss")</script>Hello';
    const result = sanitizeInput(malicious);
    expect(result).not.toContain('<script>');
    expect(result).toContain('Hello');
  });

  it('removes event handler attributes from HTML input', () => {
    const malicious = '<img src="x" onerror="alert(1)">';
    const result = sanitizeInput(malicious);
    expect(result).not.toContain('onerror');
  });

  it('sanitizes all string properties of an object', () => {
    const dirtyObj = {
      name: '<b>John</b><script>hack()</script>',
      age: 25,
      location: '<img src=x onerror=alert(1)>Stadium',
    };
    const clean = sanitizeObject(dirtyObj);
    expect(clean.name).not.toContain('<script>');
    expect(clean.age).toBe(25);
    expect(clean.location).not.toContain('onerror');
  });

  it('handles empty and null-like strings gracefully', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput('   ')).toBe('   ');
  });
});
