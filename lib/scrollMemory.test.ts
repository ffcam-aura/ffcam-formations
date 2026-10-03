import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { saveScrollPosition, takeScrollPosition } from './scrollMemory';

const aller = (url: string, y: number) => {
  window.history.replaceState(null, '', url);
  window.scrollY = y;
};

describe('scrollMemory', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('rend la position mémorisée pour la même URL, une seule fois', () => {
    aller('/?discipline=Escalade', 2021);
    saveScrollPosition();

    aller('/?discipline=Escalade', 0);
    expect(takeScrollPosition()).toBe(2021);
    expect(takeScrollPosition()).toBeNull();
  });

  it("ne rend rien pour une autre URL (autres filtres)", () => {
    aller('/?discipline=Escalade', 2021);
    saveScrollPosition();

    aller('/?discipline=Alpinisme', 0);
    expect(takeScrollPosition()).toBeNull();
  });

  it('ne rend rien au-delà de 30 minutes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T10:00:00Z'));
    aller('/', 800);
    saveScrollPosition();

    vi.setSystemTime(new Date('2026-10-03T10:31:00Z'));
    expect(takeScrollPosition()).toBeNull();
  });

  it('ne plante pas si le stockage est indisponible (navigation privée, quota)', () => {
    // Espion sur le prototype : dans jsdom, affecter une propriété à sessionStorage crée une entrée
    const spy = vi.spyOn(Object.getPrototypeOf(sessionStorage), 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    aller('/', 500);
    expect(() => saveScrollPosition()).not.toThrow();
    spy.mockRestore();
    expect(takeScrollPosition()).toBeNull();
  });
});
