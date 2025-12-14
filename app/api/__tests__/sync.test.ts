import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../sync/route';

// Mock dependencies - use inline values to avoid hoisting issues
vi.mock('@/env', () => ({
  env: {
    CRON_SECRET: 'test-secret-12345678901234567890',
    SYNC_NOTIFICATION_EMAIL: 'test@example.com',
  },
}));

const TEST_SECRET = 'test-secret-12345678901234567890';

vi.mock('@/services/formation/sync.service', () => ({
  SyncService: {
    synchronize: vi.fn(),
    sendErrorReport: vi.fn(),
    sendPartialErrorReport: vi.fn(),
    pingHealthcheck: vi.fn()
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when no authorization header is provided', async () => {
    const request = new Request('http://localhost/api/sync', {
      method: 'GET'
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
  });

  it('should return 401 when authorization header is invalid', async () => {
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
    vi.mocked(SyncService.synchronize).mockResolvedValue({
      formations: [],
      succeeded: 0,
      errors: [],
      duration: 1,
      stats: { total: 0, synchronized: 0, errors: 0, duration: '1s' }
    });
    vi.mocked(SyncService.pingHealthcheck).mockResolvedValue(undefined);

    const request = new Request('http://localhost/api/sync', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_SECRET}`
      }
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(SyncService.synchronize).toHaveBeenCalled();
    expect(SyncService.pingHealthcheck).toHaveBeenCalledWith(true, expect.any(String));
  });

  it('should send partial error report when sync has some errors', async () => {
    const syncResult = {
      formations: [{ reference: 'F1' }, { reference: 'F2' }],
      succeeded: 1,
      errors: [{ reference: 'F2', error: 'Parse error' }],
      duration: 1,
      stats: { total: 2, synchronized: 1, errors: 1, duration: '1s' }
    };

    // @ts-expect-error - Partial mock for testing
    vi.mocked(SyncService.synchronize).mockResolvedValue(syncResult);
    vi.mocked(SyncService.sendPartialErrorReport).mockResolvedValue(undefined);
    vi.mocked(SyncService.pingHealthcheck).mockResolvedValue(undefined);

    const request = new Request('http://localhost/api/sync', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_SECRET}`
      }
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(SyncService.sendPartialErrorReport).toHaveBeenCalledWith(syncResult);
  });

  it('should return failure and send error report on sync error', async () => {
    const error = new Error('Sync failed');
    vi.mocked(SyncService.synchronize).mockRejectedValue(error);
    vi.mocked(SyncService.sendErrorReport).mockResolvedValue(undefined);
    vi.mocked(SyncService.pingHealthcheck).mockResolvedValue(undefined);

    const request = new Request('http://localhost/api/sync', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_SECRET}`
      }
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(SyncService.sendErrorReport).toHaveBeenCalledWith(error);
    expect(SyncService.pingHealthcheck).toHaveBeenCalledWith(false, 'Sync failed');
  });
});
