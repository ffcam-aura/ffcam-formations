import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Filters from './FormationsFilters';
import { COMITE_TOOLTIP } from '@/lib/regions';

const updateUrl = vi.fn();
vi.mock('@/hooks/useUrlFilters', () => ({
  useUrlFilters: () => ({
    updateUrl,
    getFiltersFromUrl: () => ({
      searchQuery: '', location: '', discipline: '', organisateur: '', comites: ['93'],
      startDate: '', endDate: '', availableOnly: false, showPastFormations: false,
    }),
  }),
}));

const comites = [
  { value: '84', label: 'Auvergne-Rhône-Alpes' },
  { value: '93', label: "Provence-Alpes-Côte d'Azur" },
];

const organisateurRegions = {
  'CLUB ALPIN FRANCAIS FAVERGES': ['84'],
  'COMITE REGIONAL PROVENCE-ALPES-COTE D\'AZUR': ['93'],
};

const renderFilters = (onFilterChange = vi.fn()) => {
  render(
    <Filters
      onFilterChange={onFilterChange}
      locations={[]}
      disciplines={[]}
      organisateurs={Object.keys(organisateurRegions)}
      organisateurRegions={organisateurRegions}
      comites={comites}
      showPastFormations={false}
    />
  );
  return onFilterChange;
};

describe('Filtres — comité régional organisateur', () => {
  it('affiche le multiselect et son info-bulle explicative', () => {
    renderFilters();
    expect(screen.getByRole('button', { name: /Comité régional organisateur/ })).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent(COMITE_TOOLTIP);
    expect(screen.getByRole('button', { name: /À propos du filtre/ }))
      .toHaveAccessibleDescription(COMITE_TOOLTIP);
  });

  it('reprend les comités présents dans l’URL', () => {
    const onFilterChange = renderFilters();
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({ comites: ['93'] }));
  });

  it('transmet les comités choisis au filtrage', () => {
    const onFilterChange = renderFilters();
    fireEvent.click(screen.getByRole('button', { name: /Comité régional organisateur/ }));
    fireEvent.click(screen.getByLabelText('Auvergne-Rhône-Alpes'));
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({ comites: ['93', '84'] }));
  });

  it('réinitialise les comités', () => {
    const onFilterChange = renderFilters();
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser les filtres/ }));
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({ comites: [] }));
  });

  it('affiche le comité régional avant l’organisateur', () => {
    renderFilters();
    const comite = screen.getByRole('button', { name: /Comité régional organisateur/ });
    const organisateur = screen.getByLabelText('Filtrer par organisateur');
    expect(comite.compareDocumentPosition(organisateur) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('ne propose que les organisateurs des comités sélectionnés', () => {
    renderFilters(); // URL : comites=93
    const options = () => [...(screen.getByLabelText('Filtrer par organisateur') as HTMLSelectElement).options].map(o => o.text);
    expect(options()).toEqual(['Tous les organisateurs de ces comités', "COMITE REGIONAL PROVENCE-ALPES-COTE D'AZUR"]);

    fireEvent.click(screen.getByRole('button', { name: /Comité régional organisateur/ }));
    fireEvent.click(screen.getByLabelText("Provence-Alpes-Côte d'Azur")); // plus aucun comité
    expect(options()).toEqual(['Tous les organisateurs', 'CLUB ALPIN FRANCAIS FAVERGES', "COMITE REGIONAL PROVENCE-ALPES-COTE D'AZUR"]);
  });

  it('retire l’organisateur choisi s’il ne fait plus partie des comités sélectionnés', () => {
    const onFilterChange = renderFilters(); // URL : comites=93
    fireEvent.change(screen.getByLabelText('Filtrer par organisateur'), {
      target: { value: "COMITE REGIONAL PROVENCE-ALPES-COTE D'AZUR" },
    });
    fireEvent.click(screen.getByRole('button', { name: /Comité régional organisateur/ }));
    fireEvent.click(screen.getByLabelText('Auvergne-Rhône-Alpes')); // 93 + 84 : on garde
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({
      comites: ['93', '84'], organisateur: "COMITE REGIONAL PROVENCE-ALPES-COTE D'AZUR",
    }));
    fireEvent.click(screen.getByLabelText("Provence-Alpes-Côte d'Azur")); // 84 seul : on retire
    expect(onFilterChange).toHaveBeenLastCalledWith(expect.objectContaining({ comites: ['84'], organisateur: '' }));
  });
});
