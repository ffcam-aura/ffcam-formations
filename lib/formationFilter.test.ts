import { describe, it, expect } from 'vitest';
import { formatFilters } from './formationFilter';
import { defaultFilters } from '@/hooks/userFormationsFilter';
import { makeFormation } from '@/test/factories';

describe('formatFilters — comité régional organisateur', () => {
  const future = ['2999-06-01T00:00:00.000Z'];
  const formations = [
    makeFormation({ reference: '2027FCCOPPE84712', dates: future }), // Auvergne-Rhône-Alpes
    makeFormation({ reference: '2027FCCOPIN75706', dates: future }), // Nouvelle-Aquitaine
    makeFormation({ reference: '2026SNSMIQT93701', dates: future }), // PACA
    makeFormation({ reference: 'REF-SANS-REGION', dates: future }),
  ];
  const refs = (list: typeof formations) => list.map(f => f.reference);

  it('ne filtre pas sans comité sélectionné', () => {
    expect(formatFilters(formations, defaultFilters)).toHaveLength(4);
  });

  it('garde les formations des comités sélectionnés (choix multiple)', () => {
    expect(refs(formatFilters(formations, { ...defaultFilters, comites: ['84', '93'] })))
      .toEqual(['2027FCCOPPE84712', '2026SNSMIQT93701']);
  });

  it('se combine avec les autres filtres', () => {
    const mixed = [
      ...formations,
      makeFormation({ reference: '2027ESESINT84701', discipline: 'Escalade', dates: future }),
    ];
    expect(refs(formatFilters(mixed, { ...defaultFilters, comites: ['84'], discipline: 'Escalade' })))
      .toEqual(['2027ESESINT84701']);
  });
});

describe('formatFilters — niveau de stage', () => {
  const future = ['2999-06-01T00:00:00.000Z'];
  const formations = [
    makeFormation({ reference: '2027SNSMINI84701', discipline: 'Ski alpinisme', dates: future }), // formation initiateur 1er degré
    makeFormation({ reference: '2027SNSMINT84701', discipline: 'Ski alpinisme', dates: future }), // certification 1er degré
    makeFormation({ reference: '2027SNSMRIN84701', discipline: 'Ski alpinisme', dates: future }), // recyclage
    makeFormation({ reference: '2027ESESINT84701', discipline: 'Escalade', dates: future }),
    makeFormation({ reference: 'REF-SANS-NIVEAU', discipline: 'Ski alpinisme', dates: future }),
  ];
  const refs = (list: typeof formations) => list.map(f => f.reference);

  it('ne filtre pas sans niveau sélectionné', () => {
    expect(formatFilters(formations, defaultFilters)).toHaveLength(5);
  });

  it('accepte plusieurs niveaux', () => {
    expect(refs(formatFilters(formations, { ...defaultFilters, niveaux: ['initiateur-1-formation', 'recyclage'] })))
      .toEqual(['2027SNSMINI84701', '2027SNSMRIN84701']);
  });

  it('se combine avec la discipline (cas de l’issue #31)', () => {
    expect(refs(formatFilters(formations, {
      ...defaultFilters,
      discipline: 'Ski alpinisme',
      niveaux: ['initiateur-1-certification'],
    }))).toEqual(['2027SNSMINT84701']);
  });
});
