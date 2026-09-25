import { describe, it, expect } from 'vitest';
import {
  getRegionCodeFromReference,
  getRegionLabel,
  getAllRegionOptions,
  getRegionOptionsFromFormations,
  filterFormationsByRegions,
  isKnownRegionCode,
  getOrganisateurRegions,
  filterOrganisateursByRegions,
} from './regions';

describe('getRegionCodeFromReference', () => {
  it.each([
    ['2027FCCOPPE84712', '84'], // CAF Faverges → Auvergne-Rhône-Alpes
    ['2027FCCOPIN75706', '75'], // CAF Niort → Nouvelle-Aquitaine
    ['2026SNSMIQT93701', '93'], // Comité PACA
    ['2027FCFCEPI27801', '27'], // numéro d'ordre en 8xx
    ['2027FCCOPIN28701', '28'], // CAF Le Havre → Normandie
    ['2027ESVFCI227701', '27'], // code niveau avec un chiffre (CI2, via ferrata)
    ['2027ES**PPE84701', '84'], // « * » accepté dans les codes
  ])('extrait la région de %s', (reference, expected) => {
    expect(getRegionCodeFromReference(reference)).toBe(expected);
  });

  it('tolère espaces et minuscules', () => {
    expect(getRegionCodeFromReference(' 2027fccoppe84712 ')).toBe('84');
  });

  it.each([['REF-001'], [''], ['2027FCCOPPE8471'], ['2027FCCOPPE847123'], [null], [undefined]])(
    'renvoie null pour une référence inexploitable (%s)',
    reference => {
      expect(getRegionCodeFromReference(reference)).toBeNull();
    }
  );
});

describe('libellés', () => {
  it('donne le nom de la région', () => {
    expect(getRegionLabel('84')).toBe('Auvergne-Rhône-Alpes');
    expect(getRegionLabel('93')).toBe("Provence-Alpes-Côte d'Azur");
  });

  it('connaît la Section fédérale et la délégation du Maroc', () => {
    expect(getRegionLabel('25')).toBe('Section fédérale');
    expect(getRegionLabel('99')).toBe('Délégation régionale du Maroc');
  });

  it('reste lisible pour un code inconnu', () => {
    expect(isKnownRegionCode('98')).toBe(false);
    expect(getRegionLabel('98')).toBe('Région 98');
  });

  it('liste toutes les régions triées par libellé', () => {
    const labels = getAllRegionOptions().map(o => o.label);
    expect(labels).toHaveLength(20);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b, 'fr')));
  });
});

describe('getRegionOptionsFromFormations', () => {
  it('ne propose que les régions présentes, sans doublon', () => {
    const options = getRegionOptionsFromFormations([
      { reference: '2027FCCOPPE84712' },
      { reference: '2027FCCOPIN84701' },
      { reference: '2027FCCOPIN75706' },
      { reference: 'REF-001' },
    ]);
    expect(options).toEqual([
      { value: '84', label: 'Auvergne-Rhône-Alpes' },
      { value: '75', label: 'Nouvelle-Aquitaine' },
    ]);
  });
});

describe('filterFormationsByRegions', () => {
  const formations = [
    { reference: '2027FCCOPPE84712' },
    { reference: '2027FCCOPIN75706' },
    { reference: '2026SNSMIQT93701' },
    { reference: 'REF-001' },
  ];

  it('ne filtre rien sans région sélectionnée', () => {
    expect(filterFormationsByRegions(formations, [])).toBe(formations);
    expect(filterFormationsByRegions(formations, undefined)).toBe(formations);
  });

  it('garde les formations des régions sélectionnées', () => {
    expect(filterFormationsByRegions(formations, ['84', '93']).map(f => f.reference)).toEqual([
      '2027FCCOPPE84712',
      '2026SNSMIQT93701',
    ]);
  });

  it('exclut les références inexploitables dès qu’un filtre est actif', () => {
    expect(filterFormationsByRegions(formations, ['84']).map(f => f.reference)).toEqual(['2027FCCOPPE84712']);
  });
});

describe('organisateurs par région', () => {
  const formations = [
    { reference: '2027FCCOPPE84712', organisateur: 'CLUB ALPIN FRANCAIS FAVERGES' },
    { reference: '2027FCCOPPE84701', organisateur: 'COMITE DEPARTEMENTAL SAVOIE' },
    { reference: '2027FCCOPIN75706', organisateur: 'CLUB ALPIN FRANCAIS NIORT' },
    { reference: 'REF-001', organisateur: 'SANS REFERENCE' },
  ];
  const regionsParOrganisateur = getOrganisateurRegions(formations);
  const tous = ['CLUB ALPIN FRANCAIS FAVERGES', 'CLUB ALPIN FRANCAIS NIORT', 'COMITE DEPARTEMENTAL SAVOIE', 'SANS REFERENCE'];

  it('associe chaque organisateur à ses régions', () => {
    expect(regionsParOrganisateur).toEqual({
      'CLUB ALPIN FRANCAIS FAVERGES': ['84'],
      'COMITE DEPARTEMENTAL SAVOIE': ['84'],
      'CLUB ALPIN FRANCAIS NIORT': ['75'],
    });
  });

  it('propose tous les organisateurs sans région choisie', () => {
    expect(filterOrganisateursByRegions(tous, regionsParOrganisateur, [])).toEqual(tous);
  });

  it('ne propose que les organisateurs des régions choisies', () => {
    expect(filterOrganisateursByRegions(tous, regionsParOrganisateur, ['84']))
      .toEqual(['CLUB ALPIN FRANCAIS FAVERGES', 'COMITE DEPARTEMENTAL SAVOIE']);
    expect(filterOrganisateursByRegions(tous, regionsParOrganisateur, ['84', '75'])).toHaveLength(3);
  });
});
