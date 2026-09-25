import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Filters from './FormationsFilters';

vi.mock('@/hooks/useUrlFilters', () => ({
  useUrlFilters: () => ({
    updateUrl: vi.fn(),
    getFiltersFromUrl: () => ({
      searchQuery: '', location: '', discipline: '', niveaux: ['initiateur-1-certification'], organisateur: '', comites: [],
      startDate: '', endDate: '', availableOnly: false, showPastFormations: false,
    }),
  }),
}));

const niveaux = [
  { value: 'initiateur-1-formation', label: 'Initiateur 1er degré – formation' },
  { value: 'initiateur-1-certification', label: 'Initiateur 1er degré – certification' },
];

const renderFilters = (onFilterChange = vi.fn()) => {
  render(
    <Filters onFilterChange={onFilterChange} locations={[]} disciplines={[]} niveaux={niveaux} comites={[]} organisateurs={[]} showPastFormations={false} />
  );
  return onFilterChange;
};

describe('Filtres — niveau de stage', () => {
  it('reprend les niveaux présents dans l’URL', () => {
    const onFilterChange = renderFilters();
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({ niveaux: ['initiateur-1-certification'] }));
    expect(screen.getByRole('button', { name: /Niveau de stage/ })).toHaveTextContent('Initiateur 1er degré – certification');
  });

  it('transmet plusieurs niveaux au filtrage', () => {
    const onFilterChange = renderFilters();
    fireEvent.click(screen.getByRole('button', { name: /Niveau de stage/ }));
    fireEvent.click(screen.getByLabelText('Initiateur 1er degré – formation'));
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({
      niveaux: ['initiateur-1-certification', 'initiateur-1-formation'],
    }));
  });

  it('réinitialise les niveaux', () => {
    const onFilterChange = renderFilters();
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser les filtres/ }));
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({ niveaux: [] }));
  });
});
