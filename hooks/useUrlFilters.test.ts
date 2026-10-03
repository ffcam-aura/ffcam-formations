import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUrlFilters } from './useUrlFilters';
import type { Filters } from '@/hooks/userFormationsFilter';

const router = { push: vi.fn(), replace: vi.fn() };

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(''),
}));

const filtres: Filters = {
  searchQuery: '',
  location: '',
  discipline: '',
  niveaux: [],
  organisateur: '',
  comites: ['84'],
  startDate: '',
  endDate: '',
  availableOnly: false,
  showPastFormations: false,
};

describe('useUrlFilters', () => {
  beforeEach(() => {
    router.push.mockReset();
    router.replace.mockReset();
  });

  it("met à jour l'URL sans remonter en haut de page ni ajouter d'entrée dans l'historique", () => {
    // Sinon chaque coche d'un filtre ramène la page en haut (liste ouverte hors écran sur mobile)
    // et le bouton Précédent repasse par des URLs que les filtres n'affichent plus.
    const { result } = renderHook(() => useUrlFilters());

    result.current.updateUrl(filtres);

    expect(router.replace).toHaveBeenCalledWith('/?comites=84', { scroll: false });
    expect(router.push).not.toHaveBeenCalled();
  });
});
