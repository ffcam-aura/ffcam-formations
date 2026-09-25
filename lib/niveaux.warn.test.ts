// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const warn = vi.fn();
vi.mock('@/lib/logger', () => ({ logger: { warn, info: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

const { getNiveauFromReference } = await import('./niveaux');

describe('codes niveau inconnus (côté serveur)', () => {
  beforeEach(() => warn.mockClear());

  it('logue un warning une seule fois par code inconnu', () => {
    getNiveauFromReference('2027FCCOZZZ84701');
    getNiveauFromReference('2027FCCOZZZ93702');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('inconnu'), { code: 'ZZZ', reference: '2027FCCOZZZ84701' });
  });

  it('logue un warning pour une référence illisible', () => {
    getNiveauFromReference('REF-ILLISIBLE');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('illisible'), { reference: 'REF-ILLISIBLE' });
  });

  it('ne logue rien pour les codes connus, y compris ceux rangés dans « Autres »', () => {
    getNiveauFromReference('2027SNSMINT84701');
    getNiveauFromReference('2027FCFCPSC84719');
    expect(warn).not.toHaveBeenCalled();
  });
});
