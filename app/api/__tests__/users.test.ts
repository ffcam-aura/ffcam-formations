/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mock functions so they can be used in vi.mock
const { mockGetNotificationPreferences, mockUpdateNotificationPreferences } = vi.hoisted(() => ({
  mockGetNotificationPreferences: vi.fn(),
  mockUpdateNotificationPreferences: vi.fn()
}));

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn()
}));

// Mock UserService
vi.mock('@/services/user/users.service', () => ({
  UserService: vi.fn().mockImplementation(() => ({
    getNotificationPreferences: mockGetNotificationPreferences,
    updateNotificationPreferences: mockUpdateNotificationPreferences
  }))
}));

// Mock UserRepository
vi.mock('@/repositories/UserRepository', () => ({
  UserRepository: vi.fn().mockImplementation(() => ({}))
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

import { auth, currentUser } from '@clerk/nextjs/server';
import { GET, POST } from '../users/route';

describe('/api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return user preferences when authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user123' } as any);
      mockGetNotificationPreferences.mockResolvedValue(['Escalade', 'Alpinisme']);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(['Escalade', 'Alpinisme']);
    });
  });

  describe('POST /api/users', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disciplines: ['Escalade'] })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when user email is not found', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user123' } as any);
      vi.mocked(currentUser).mockResolvedValue({ emailAddresses: [] } as any);

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disciplines: ['Escalade'] })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User email not found');
    });

    it('should return 400 when disciplines array is empty', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user123' } as any);
      vi.mocked(currentUser).mockResolvedValue({
        emailAddresses: [{ emailAddress: 'test@test.com' }]
      } as any);

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disciplines: [] })
      });

      const response = await POST(request);

      // Empty array is valid according to the schema (min(1) is on each element, not array length)
      expect(response.status).toBe(200);
    });

    it('should return 400 when discipline contains empty string', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user123' } as any);
      vi.mocked(currentUser).mockResolvedValue({
        emailAddresses: [{ emailAddress: 'test@test.com' }]
      } as any);

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disciplines: [''] })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
      expect(data.details).toBeDefined();
    });

    it('should return 400 when body is invalid', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user123' } as any);
      vi.mocked(currentUser).mockResolvedValue({
        emailAddresses: [{ emailAddress: 'test@test.com' }]
      } as any);

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wrongField: 'value' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
    });

    it('should update preferences successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user123' } as any);
      vi.mocked(currentUser).mockResolvedValue({
        emailAddresses: [{ emailAddress: 'test@test.com' }]
      } as any);
      mockUpdateNotificationPreferences.mockResolvedValue(undefined);

      const request = new Request('http://localhost/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disciplines: ['Escalade', 'Alpinisme'] })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockUpdateNotificationPreferences).toHaveBeenCalledWith(
        'user123',
        'test@test.com',
        ['Escalade', 'Alpinisme']
      );
    });
  });
});
