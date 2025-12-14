import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to create mock function before mock is hoisted
const { mockSendMail } = vi.hoisted(() => {
  return { mockSendMail: vi.fn() };
});

// Mock nodemailer before importing EmailService
vi.mock('nodemailer', () => {
  return {
    default: {
      createTransport: () => ({
        sendMail: mockSendMail,
      }),
    },
  };
});

vi.mock('@/env', () => ({
  env: {
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: 587,
    SMTP_USER: 'user@test.com',
    SMTP_PASSWORD: 'password123',
    EMAIL_FROM: 'noreply@test.com',
    VERCEL_ENV: 'production',
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import after mocks
import { EmailService } from './email.service';
import { logger } from '@/lib/logger';

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMail.mockReset();
  });

  describe('sendEmail', () => {
    it('should send email with correct parameters', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });

      await EmailService.sendEmail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });
    });

    it('should log success after sending', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });

      await EmailService.sendEmail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Content</p>',
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Email sent to recipient@test.com',
        { subject: 'Test Subject' }
      );
    });

    it('should handle array of recipients', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });

      await EmailService.sendEmail({
        to: ['user1@test.com', 'user2@test.com'],
        subject: 'Bulk Test',
        html: '<p>Content</p>',
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user1@test.com', 'user2@test.com'],
        })
      );

      expect(logger.info).toHaveBeenCalledWith(
        'Email sent to user1@test.com, user2@test.com',
        expect.any(Object)
      );
    });

    it('should throw and log error on failure', async () => {
      const error = new Error('SMTP connection failed');
      mockSendMail.mockRejectedValue(error);

      await expect(
        EmailService.sendEmail({
          to: 'recipient@test.com',
          subject: 'Test',
          html: '<p>Content</p>',
        })
      ).rejects.toThrow('SMTP connection failed');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to send email to recipient@test.com',
        error,
        { subject: 'Test' }
      );
    });
  });
});

describe('EmailService in development', () => {
  beforeEach(() => {
    vi.resetModules();
    mockSendMail.mockReset();
  });

  it('should prefix subject with [DEV] in non-production', async () => {
    // Re-mock with development environment
    vi.doMock('@/env', () => ({
      env: {
        SMTP_HOST: 'smtp.test.com',
        SMTP_PORT: 587,
        SMTP_USER: 'user@test.com',
        SMTP_PASSWORD: 'password123',
        EMAIL_FROM: 'noreply@test.com',
        VERCEL_ENV: 'development',
      },
    }));

    vi.doMock('nodemailer', () => ({
      default: {
        createTransport: () => ({
          sendMail: mockSendMail,
        }),
      },
    }));

    mockSendMail.mockResolvedValue({ messageId: 'test-id' });

    const { EmailService: EmailServiceDev } = await import('./email.service');

    await EmailServiceDev.sendEmail({
      to: 'recipient@test.com',
      subject: 'Test Subject',
      html: '<p>Content</p>',
    });

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: '[DEV] Test Subject',
      })
    );
  });
});
