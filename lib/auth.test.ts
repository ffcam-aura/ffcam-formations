import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateCronSecret, unauthorizedResponse } from './auth';

describe('auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateCronSecret', () => {
    it('should return false when authHeader is null', () => {
      process.env.CRON_SECRET = 'test-secret';
      expect(validateCronSecret(null)).toBe(false);
    });

    it('should return false when authHeader is empty', () => {
      process.env.CRON_SECRET = 'test-secret';
      expect(validateCronSecret('')).toBe(false);
    });

    it('should return false when CRON_SECRET is not set', () => {
      delete process.env.CRON_SECRET;
      expect(validateCronSecret('Bearer some-token')).toBe(false);
    });

    it('should return false when authHeader length differs from expected', () => {
      process.env.CRON_SECRET = 'test-secret';
      expect(validateCronSecret('Bearer wrong')).toBe(false);
    });

    it('should return false when authHeader does not match', () => {
      process.env.CRON_SECRET = 'test-secret';
      // Same length but different content
      expect(validateCronSecret('Bearer test-secreX')).toBe(false);
    });

    it('should return true when authHeader matches exactly', () => {
      process.env.CRON_SECRET = 'test-secret-12345';
      expect(validateCronSecret('Bearer test-secret-12345')).toBe(true);
    });

    it('should return false without Bearer prefix', () => {
      process.env.CRON_SECRET = 'test-secret';
      expect(validateCronSecret('test-secret')).toBe(false);
    });

    it('should handle special characters in secret', () => {
      process.env.CRON_SECRET = 'test-secret!@#$%^&*()';
      expect(validateCronSecret('Bearer test-secret!@#$%^&*()')).toBe(true);
    });

    it('should be case-sensitive', () => {
      process.env.CRON_SECRET = 'Test-Secret';
      expect(validateCronSecret('Bearer test-secret')).toBe(false);
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return a Response with status 401', () => {
      const response = unauthorizedResponse();
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(401);
    });

    it('should return "Unauthorized" as body', async () => {
      const response = unauthorizedResponse();
      const text = await response.text();
      expect(text).toBe('Unauthorized');
    });
  });
});
