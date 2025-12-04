import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../sync/route';

// Mock dependencies
vi.mock('@/services/formation/sync.service', () => ({
  SyncService: {
    synchronize: vi.fn(),
    sendSyncReport: vi.fn(),
    sendErrorReport: vi.fn()
  }
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

import { SyncService } from '@/services/formation/sync.service';

describe('GET /api/sync', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return 401 when no authorization header is provided', async () => {
    process.env.CRON_SECRET = 'test-secret-12345678901234567890';

    const request = new Request('http://localhost/api/sync', {
      method: 'GET'
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
  });

  it('should return 401 when authorization header is invalid', async () => {
    process.env.CRON_SECRET = 'test-secret-12345678901234567890';

    const request = new Request('http://localhost/api/sync', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer wrong-secret'
      }
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('should return success when authorization is valid', async () => {
    const secret = 'test-secret-12345678901234567890';
    process.env.CRON_SECRET = secret;

    vi.mocked(SyncService.synchronize).mockResolvedValue({
      formations: [],
      succeeded: 0,
      errors: [],
      duration: 1,
      stats: { total: 0, synchronized: 0, errors: 0, duration: '1s' }
    });
    vi.mocked(SyncService.sendSyncReport).mockResolvedValue(undefined);

    const request = new Request('http://localhost/api/sync', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secret}`
      }
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(SyncService.synchronize).toHaveBeenCalled();
    expect(SyncService.sendSyncReport).toHaveBeenCalled();
  });

  it('should return failure and send error report on sync error', async () => {
    const secret = 'test-secret-12345678901234567890';
    process.env.CRON_SECRET = secret;

    const error = new Error('Sync failed');
    vi.mocked(SyncService.synchronize).mockRejectedValue(error);
    vi.mocked(SyncService.sendErrorReport).mockResolvedValue(undefined);

    const request = new Request('http://localhost/api/sync', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secret}`
      }
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(SyncService.sendErrorReport).toHaveBeenCalledWith(error);
  });
});
