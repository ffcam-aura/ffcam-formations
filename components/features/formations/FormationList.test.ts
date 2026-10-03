import { describe, it, expect } from 'vitest';
import { getEntryDelay } from './FormationList';

describe('getEntryDelay', () => {
  it('échelonne l’apparition des premières cartes', () => {
    expect(getEntryDelay(0)).toBe(0);
    expect(getEntryDelay(3)).toBeCloseTo(0.06);
  });

  it('plafonne le délai pour les longues listes', () => {
    // Avec les formations passées (~1 600 cartes), un délai de 0,02 s par carte
    // laissait les dernières invisibles plus de 30 s
    expect(getEntryDelay(1500)).toBeLessThanOrEqual(0.3);
  });
});
