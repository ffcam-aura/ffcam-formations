import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before imports
vi.mock('@/lib/scraper', () => ({
  FFCAMScraper: {
    scrapeFormations: vi.fn(),
  },
}));

vi.mock('@/services/email/email.service', () => ({
  EmailService: {
    sendEmail: vi.fn(),
  },
}));

vi.mock('@/env', () => ({
  env: {
    SYNC_NOTIFICATION_EMAIL: 'admin@test.com',
    HEALTHCHECK_SYNC_URL: 'https://hc-ping.com/test-uuid',
  },
}));

vi.mock('@/repositories/FormationRepository', () => ({
  FormationRepository: vi.fn().mockImplementation(() => ({
    upsertFormations: vi.fn(),
    upsertFormation: vi.fn(),
    getLastSync: vi.fn(),
  })),
}));

vi.mock('@/services/formation/formations.service', () => ({
  FormationService: vi.fn().mockImplementation(() => ({
    upsertFormations: vi.fn(),
    upsertFormation: vi.fn(),
    getLastSync: vi.fn(),
  })),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import { SyncService } from './sync.service';
import { FFCAMScraper } from '@/lib/scraper';
import { EmailService } from '@/services/email/email.service';
import { Formation } from '@/types/formation';

const createMockFormation = (reference: string): Formation => ({
  reference,
  titre: `Formation ${reference}`,
  dates: ['01/01/2024'],
  lieu: 'Lyon',
  informationStagiaire: '',
  nombreParticipants: 10,
  placesRestantes: 5,
  hebergement: 'Gîte',
  tarif: 100,
  discipline: 'Alpinisme',
  organisateur: 'FFCAM',
  responsable: 'John Doe',
  emailContact: 'contact@test.com',
  documents: [],
  firstSeenAt: new Date().toISOString(),
  lastSeenAt: new Date().toISOString(),
});

describe('SyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('synchronize', () => {
    it('should scrape formations and return sync result', async () => {
      const mockFormations = [
        createMockFormation('F1'),
        createMockFormation('F2'),
      ];

      vi.mocked(FFCAMScraper.scrapeFormations).mockResolvedValue(mockFormations);

      const result = await SyncService.synchronize();

      expect(FFCAMScraper.scrapeFormations).toHaveBeenCalled();
      expect(result.formations).toEqual(mockFormations);
      expect(result.succeeded).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.stats.total).toBe(2);
    });

    it('should handle empty formation list', async () => {
      vi.mocked(FFCAMScraper.scrapeFormations).mockResolvedValue([]);

      const result = await SyncService.synchronize();

      expect(result.formations).toEqual([]);
      expect(result.succeeded).toBe(0);
      expect(result.stats.total).toBe(0);
    });

    it('should propagate scraper errors', async () => {
      const error = new Error('Scraping failed');
      vi.mocked(FFCAMScraper.scrapeFormations).mockRejectedValue(error);

      await expect(SyncService.synchronize()).rejects.toThrow('Scraping failed');
    });

    it('should track duration', async () => {
      vi.mocked(FFCAMScraper.scrapeFormations).mockResolvedValue([]);

      const result = await SyncService.synchronize();

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.stats.duration).toMatch(/^\d+\.\d{2}s$/);
    });
  });

  describe('sendErrorReport', () => {
    it('should send error email with correct subject', async () => {
      vi.mocked(EmailService.sendEmail).mockResolvedValue(undefined);

      await SyncService.sendErrorReport(new Error('Test error'));

      expect(EmailService.sendEmail).toHaveBeenCalledWith({
        to: 'admin@test.com',
        subject: '[FFCAM] ❌ Erreur critique lors de la synchronisation',
        html: expect.stringContaining('Test error'),
      });
    });

    it('should include formation stats in error report', async () => {
      vi.mocked(EmailService.sendEmail).mockResolvedValue(undefined);
      const formations = [createMockFormation('F1')];

      await SyncService.sendErrorReport(new Error('Error'), formations, 1);

      expect(EmailService.sendEmail).toHaveBeenCalledWith({
        to: 'admin@test.com',
        subject: expect.any(String),
        html: expect.stringContaining('Formations récupérées : 1'),
      });
    });

    it('should handle non-Error objects', async () => {
      vi.mocked(EmailService.sendEmail).mockResolvedValue(undefined);

      await SyncService.sendErrorReport('String error');

      expect(EmailService.sendEmail).toHaveBeenCalledWith({
        to: 'admin@test.com',
        subject: expect.any(String),
        html: expect.stringContaining('String error'),
      });
    });
  });

  describe('sendPartialErrorReport', () => {
    it('should not send email when no errors', async () => {
      const syncResult = {
        formations: [],
        succeeded: 0,
        errors: [],
        duration: 1,
        stats: { total: 0, synchronized: 0, errors: 0, duration: '1s' },
      };

      await SyncService.sendPartialErrorReport(syncResult);

      expect(EmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should send email with error details when errors exist', async () => {
      vi.mocked(EmailService.sendEmail).mockResolvedValue(undefined);

      const syncResult = {
        formations: [createMockFormation('F1'), createMockFormation('F2')],
        succeeded: 1,
        errors: [{ reference: 'F2', error: 'Parse error' }],
        duration: 2.5,
        stats: { total: 2, synchronized: 1, errors: 1, duration: '2.50s' },
      };

      await SyncService.sendPartialErrorReport(syncResult);

      expect(EmailService.sendEmail).toHaveBeenCalledWith({
        to: 'admin@test.com',
        subject: '[FFCAM] ⚠️ Sync terminé avec 1 erreur(s)',
        html: expect.stringContaining('F2'),
      });
    });

    it('should include all error references in email', async () => {
      vi.mocked(EmailService.sendEmail).mockResolvedValue(undefined);

      const syncResult = {
        formations: [],
        succeeded: 0,
        errors: [
          { reference: 'F1', error: 'Error 1' },
          { reference: 'F2', error: 'Error 2' },
        ],
        duration: 1,
        stats: { total: 2, synchronized: 0, errors: 2, duration: '1s' },
      };

      await SyncService.sendPartialErrorReport(syncResult);

      const emailCall = vi.mocked(EmailService.sendEmail).mock.calls[0][0];
      expect(emailCall.html).toContain('F1');
      expect(emailCall.html).toContain('F2');
      expect(emailCall.html).toContain('Error 1');
      expect(emailCall.html).toContain('Error 2');
    });
  });

  describe('pingHealthcheck', () => {
    it('should POST to healthcheck URL on success', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await SyncService.pingHealthcheck(true, 'Test message');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hc-ping.com/test-uuid',
        expect.objectContaining({
          method: 'POST',
          body: 'Test message',
        })
      );
    });

    it('should POST to /fail endpoint on failure', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await SyncService.pingHealthcheck(false, 'Error message');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hc-ping.com/test-uuid/fail',
        expect.objectContaining({
          method: 'POST',
          body: 'Error message',
        })
      );
    });

    it('should not throw on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Should not throw
      await expect(SyncService.pingHealthcheck(true)).resolves.toBeUndefined();
    });

    it('should log warning on non-ok response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      const { logger } = await import('@/lib/logger');

      await SyncService.pingHealthcheck(true);

      expect(logger.warn).toHaveBeenCalledWith(
        'Healthcheck ping failed',
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('pingHealthcheck without URL configured', () => {
    beforeEach(() => {
      vi.doMock('@/env', () => ({
        env: {
          SYNC_NOTIFICATION_EMAIL: 'admin@test.com',
          HEALTHCHECK_SYNC_URL: undefined,
        },
      }));
    });

    it('should skip ping when URL is not configured', async () => {
      // Re-import to get new mock
      vi.resetModules();
      const { SyncService: SyncServiceNoUrl } = await import('./sync.service');

      await SyncServiceNoUrl.pingHealthcheck(true);

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
