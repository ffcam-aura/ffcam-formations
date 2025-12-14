import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitResponse,
  addRateLimitHeaders,
} from './rateLimit';

describe('rateLimit', () => {
  describe('checkRateLimit', () => {
    const config = { limit: 3, windowSeconds: 60 };

    beforeEach(() => {
      // Use unique identifiers per test to avoid interference
    });

    it('should allow first request', () => {
      const result = checkRateLimit(`test-${Date.now()}-1`, config);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
      expect(result.limit).toBe(3);
    });

    it('should decrement remaining on each request', () => {
      const id = `test-${Date.now()}-2`;

      const result1 = checkRateLimit(id, config);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit(id, config);
      expect(result2.remaining).toBe(1);

      const result3 = checkRateLimit(id, config);
      expect(result3.remaining).toBe(0);
    });

    it('should block when limit exceeded', () => {
      const id = `test-${Date.now()}-3`;

      checkRateLimit(id, config); // 1
      checkRateLimit(id, config); // 2
      checkRateLimit(id, config); // 3

      const result = checkRateLimit(id, config); // 4 - should fail

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should include reset timestamp', () => {
      const id = `test-${Date.now()}-4`;
      const before = Date.now();

      const result = checkRateLimit(id, config);

      expect(result.resetAt).toBeGreaterThan(before);
      expect(result.resetAt).toBeLessThanOrEqual(before + 60000 + 100); // 60s + small buffer
    });

    it('should track different identifiers separately', () => {
      const id1 = `test-${Date.now()}-5a`;
      const id2 = `test-${Date.now()}-5b`;

      // Exhaust id1's limit
      checkRateLimit(id1, config);
      checkRateLimit(id1, config);
      checkRateLimit(id1, config);
      const blocked = checkRateLimit(id1, config);

      // id2 should still work
      const allowed = checkRateLimit(id2, config);

      expect(blocked.success).toBe(false);
      expect(allowed.success).toBe(true);
    });
  });

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      });

      const id = getClientIdentifier(request);

      expect(id).toBe('192.168.1.1');
    });

    it('should use x-real-ip as fallback', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-real-ip': '192.168.1.2' },
      });

      const id = getClientIdentifier(request);

      expect(id).toBe('192.168.1.2');
    });

    it('should return anonymous when no headers present', () => {
      const request = new Request('http://localhost');

      const id = getClientIdentifier(request);

      expect(id).toBe('anonymous');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '10.0.0.1',
          'x-real-ip': '192.168.1.1',
        },
      });

      const id = getClientIdentifier(request);

      expect(id).toBe('10.0.0.1');
    });
  });

  describe('rateLimitResponse', () => {
    it('should return 429 status', () => {
      const result = {
        success: false,
        limit: 60,
        remaining: 0,
        resetAt: Date.now() + 30000,
      };

      const response = rateLimitResponse(result);

      expect(response.status).toBe(429);
    });

    it('should include rate limit headers', () => {
      const resetAt = Date.now() + 30000;
      const result = {
        success: false,
        limit: 60,
        remaining: 0,
        resetAt,
      };

      const response = rateLimitResponse(result);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('X-RateLimit-Reset')).toBe(resetAt.toString());
      expect(response.headers.get('Retry-After')).toBeDefined();
    });

    it('should include JSON error body', async () => {
      const result = {
        success: false,
        limit: 60,
        remaining: 0,
        resetAt: Date.now() + 30000,
      };

      const response = rateLimitResponse(result);
      const body = await response.json();

      expect(body.error).toBe('RATE_LIMIT_EXCEEDED');
      expect(body.message).toContain('Trop de requêtes');
      expect(body.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('addRateLimitHeaders', () => {
    it('should add rate limit headers to existing response', () => {
      const originalResponse = new Response('OK', { status: 200 });
      const result = {
        success: true,
        limit: 60,
        remaining: 55,
        resetAt: Date.now() + 60000,
      };

      const response = addRateLimitHeaders(originalResponse, result);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('55');
      expect(response.status).toBe(200);
    });

    it('should preserve original response status', async () => {
      const originalResponse = new Response('Created', { status: 201 });
      const result = {
        success: true,
        limit: 60,
        remaining: 59,
        resetAt: Date.now() + 60000,
      };

      const response = addRateLimitHeaders(originalResponse, result);

      expect(response.status).toBe(201);
    });
  });
});
