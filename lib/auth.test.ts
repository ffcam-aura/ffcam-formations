import { describe, it, expect, vi, beforeEach } from 'vitest';
import { unauthorizedResponse } from './auth';

// Mock the env module
vi.mock('@/env', () => ({
  env: {
    CRON_SECRET: 'test-secret-12345678901234567890',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('auth', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('validateCronSecret', () => {
    it('should return false when authHeader is null', async () => {
      const { validateCronSecret } = await import('./auth');
      expect(validateCronSecret(null)).toBe(false);
    });

    it('should return false when authHeader is empty', async () => {
      const { validateCronSecret } = await import('./auth');
      expect(validateCronSecret('')).toBe(false);
    });

    it('should return false when authHeader length differs from expected', async () => {
      const { validateCronSecret } = await import('./auth');
      expect(validateCronSecret('Bearer wrong')).toBe(false);
    });

    it('should return false when authHeader does not match', async () => {
      const { validateCronSecret } = await import('./auth');
      // Same length but different content
      expect(validateCronSecret('Bearer test-secret-1234567890123456789X')).toBe(false);
    });

    it('should return true when authHeader matches exactly', async () => {
      const { validateCronSecret } = await import('./auth');
      expect(validateCronSecret('Bearer test-secret-12345678901234567890')).toBe(true);
    });

    it('should return false without Bearer prefix', async () => {
      const { validateCronSecret } = await import('./auth');
      expect(validateCronSecret('test-secret-12345678901234567890')).toBe(false);
    });
  });

  describe('validateCronSecret with special characters', () => {
    beforeEach(() => {
      vi.doMock('@/env', () => ({
        env: {
          CRON_SECRET: 'test-secret!@#$%^&*()1234567890ab',
        },
      }));
    });

    it('should handle special characters in secret', async () => {
      const { validateCronSecret } = await import('./auth');
      expect(validateCronSecret('Bearer test-secret!@#$%^&*()1234567890ab')).toBe(true);
    });
  });

  describe('validateCronSecret case sensitivity', () => {
    beforeEach(() => {
      vi.doMock('@/env', () => ({
        env: {
          CRON_SECRET: 'Test-Secret-Case-Sensitive-12345678',
        },
      }));
    });

    it('should be case-sensitive', async () => {
      const { validateCronSecret } = await import('./auth');
      expect(validateCronSecret('Bearer test-secret-case-sensitive-12345678')).toBe(false);
    });
  });

  describe('validateCronSecret without secret configured', () => {
    beforeEach(() => {
      vi.doMock('@/env', () => ({
        env: {
          CRON_SECRET: undefined,
        },
      }));
    });

    it('should return false when CRON_SECRET is not set', async () => {
      const { validateCronSecret } = await import('./auth');
      expect(validateCronSecret('Bearer some-token')).toBe(false);
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
