// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

const warn = vi.fn();
vi.mock('@/lib/logger', () => ({ logger: { warn, info: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

const { getRegionCodeFromReference } = await import('./regions');

describe('référence illisible (côté serveur)', () => {
  it('logue un warning une seule fois par référence', () => {
    expect(getRegionCodeFromReference('REF-ILLISIBLE')).toBeNull();
    expect(getRegionCodeFromReference('REF-ILLISIBLE')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('illisible'), { reference: 'REF-ILLISIBLE' });
  });

  it('ne logue rien pour une référence valide ou vide', () => {
    warn.mockClear();
    getRegionCodeFromReference('2027ESVFCI227701');
    getRegionCodeFromReference('');
    getRegionCodeFromReference(undefined);
    expect(warn).not.toHaveBeenCalled();
  });
});
