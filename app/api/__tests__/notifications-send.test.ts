import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeFormation } from '@/test/factories';

const SECRET = 'test-secret-12345678901234567890';

vi.mock('@/env', () => ({
  env: {
    CRON_SECRET: 'test-secret-12345678901234567890',
    HEALTHCHECK_NOTIFICATIONS_EMAIL: 'controle@example.org',
  },
}));
vi.mock('@/lib/prisma', () => ({ prisma: {} }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const { getRecentFormations, notifyBatchNewFormations, sendEmail } = vi.hoisted(() => ({
  getRecentFormations: vi.fn(),
  notifyBatchNewFormations: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock('@/repositories/FormationRepository', () => ({ FormationRepository: class {} }));
vi.mock('@/repositories/NotificationRepository', () => ({ NotificationRepository: class {} }));
vi.mock('@/services/formation/formations.service', () => ({
  FormationService: class { getRecentFormations = getRecentFormations; },
}));
vi.mock('@/services/notifications/emailTemplate.service', () => ({ EmailTemplateRenderer: class {} }));
vi.mock('@/services/user/users.service', () => ({ UserService: class {} }));
vi.mock('@/services/email/email.service', () => ({ EmailService: { sendEmail } }));
vi.mock('@/services/notifications/notifications.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/notifications/notifications.service')>();
  return { ...actual, NotificationService: class { notifyBatchNewFormations = notifyBatchNewFormations; } };
});

import { GET } from '../notifications/send/route';

const appel = () => GET(new Request('http://localhost/api/notifications/send', { headers: { Authorization: `Bearer ${SECRET}` } }));
const sujetDuControle = () => sendEmail.mock.calls.find(([o]) => o.to === 'controle@example.org')?.[0].subject as string | undefined;

describe('GET /api/notifications/send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRecentFormations.mockResolvedValue([makeFormation({ reference: 'A' }), makeFormation({ reference: 'B' })]);
  });

  it("annonce dans l'email de contrôle le nombre d'abonnés et de formations envoyées, pas de paires", async () => {
    const f = (reference: string) => makeFormation({ reference });
    notifyBatchNewFormations.mockResolvedValue([
      { formation: f('A'), usersNotified: 1, errors: [], userId: 'u1' },
      { formation: f('B'), usersNotified: 1, errors: [], userId: 'u1' },
      { formation: f('A'), usersNotified: 1, errors: [], userId: 'u2' },
    ]);

    const response = await appel();

    expect(response.status).toBe(200);
    expect(sujetDuControle()).toContain('✅');
    expect(sujetDuControle()).toContain('2 abonnés');
    expect(sujetDuControle()).toContain('2 formations');
  });

  it("envoie l'email de contrôle même quand l'envoi des notifications échoue", async () => {
    // Sans cet email, une panne ne se voit qu'en remarquant l'absence du message habituel
    notifyBatchNewFormations.mockRejectedValue(new Error('Can\'t reach database server'));

    const response = await appel();

    expect(response.status).toBe(500);
    expect(sujetDuControle()).toMatch(/^❌/);
  });
});
