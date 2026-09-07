import { describe, it, expect } from 'vitest';
import { sanitizeLogContext, pseudonymize, redactUrl } from './logSanitizer';

describe('sanitizeLogContext', () => {
  it("ne laisse pas sortir l'adresse IP du rate limiter", () => {
    // Cas réel : app/api/formations/route.ts logue le clientId, issu de X-Forwarded-For.
    const clean = sanitizeLogContext({ clientId: '203.0.113.42', endpoint: '/api/formations' });

    expect(clean.clientId).not.toContain('203.0.113.42');
    expect(clean.clientId).toMatch(/^anon_[0-9a-f]{12}$/);
    expect(clean.endpoint).toBe('/api/formations');
  });

  it("retire le jeton de l'URL de healthcheck en gardant l'origine", () => {
    // Une URL de ping healthchecks.io est un secret dans son intégralité.
    const clean = sanitizeLogContext({
      url: 'https://hc-ping.com/8f3b1c2d-0000-4444-8888-aaaabbbbcccc',
      status: 500,
    });

    expect(clean.url).toBe('https://hc-ping.com/[expurgé]');
    expect(clean.status).toBe(500);
  });

  it('conserve les données de diagnostic non sensibles', () => {
    const detail = { bytes: 2_100_000, limit: 2_000_000, formations: 1432 };
    expect(sanitizeLogContext(detail)).toEqual(detail);
  });

  it('expurge les valeurs sensibles non textuelles sans les laisser fuiter', () => {
    expect(sanitizeLogContext({ token: { valeur: 'secret' } }).token).toBe('[expurgé]');
  });

  it('laisse passer un contexte absent', () => {
    expect(sanitizeLogContext(undefined)).toBeUndefined();
  });

  it('produit un pseudonyme stable pour une même valeur', () => {
    expect(pseudonymize('203.0.113.42')).toBe(pseudonymize('203.0.113.42'));
    expect(pseudonymize('203.0.113.42')).not.toBe(pseudonymize('203.0.113.43'));
  });

  it('garde une origine nue telle quelle et signale une URL invalide', () => {
    expect(redactUrl('https://hc-ping.com')).toBe('https://hc-ping.com');
    expect(redactUrl('pas-une-url')).toBe('[url invalide]');
  });
});
