import { describe, it, expect } from 'vitest';
import {
  getNiveauCodeFromReference,
  getNiveauFromReference,
  getNiveauLabel,
  getAllNiveauOptions,
  getNiveauOptionsFromFormations,
  filterFormationsByNiveaux,
  isKnownNiveau,
} from './niveaux';

describe('getNiveauFromReference', () => {
  it.each([
    ['2027SNSMINT84701', 'INT', 'initiateur-1-certification'], // Certification initiateur 1er degré
    ['2027ESESINI84701', 'INI', 'initiateur-1-formation'],
    ['2026SNSMIQT93701', 'IQT', 'initiateur-2-certification'],
    ['2027SNSMIQI84701', 'IQI', 'initiateur-2-formation'],
    ['2027SNSMRIN84701', 'RIN', 'recyclage'],
    ['2027FCCOPPE84712', 'PPE', 'pratiquant-perfectionne'],
    ['2027VMVMPPV84701', 'PPV', 'pratiquant-perfectionne'], // VTT : même niveau
    ['2027FCCOPIN75706', 'PIN', 'pratiquant-initie'],
    ['2027FCFCUFC93701', 'UFC', 'ufc'],
    ['2027FCFCEPI27801', 'EPI', 'qualification'],
    ['2025ESVFFVF27701', 'FVF', 'qualification'], // QUALIFICATION Via Ferrata FFCAM
    // Codes ajoutés après la revue de la PR #34
    ['2027VMVMPIV84701', 'PIV', 'pratiquant-initie'], // initié VTT
    ['2027SNSNCT184701', 'CT1', 'initiateur-1-certification'], // ski de rando nordique
    ['2027ESVFCI227701', 'CI2', 'initiateur-2-formation'], // via ferrata, publié le 01/10/2026
    ['2027ESESRFE76701', 'RFE', 'recyclage'], // recyclage qualif grandes voies équipées
    ['2027FCFCPSC84719', 'PSC', 'autres'],
    ['2027FCFC80184701', '801', 'autres'],
    ['2027FC**INT84701', 'INT', 'initiateur-1-certification'], // « * » accepté
  ])('%s → %s → %s', (reference, code, niveau) => {
    expect(getNiveauCodeFromReference(reference)).toBe(code);
    expect(getNiveauFromReference(reference)).toBe(niveau);
  });

  it('range un code inconnu ou une référence illisible dans « Autres formations »', () => {
    expect(getNiveauCodeFromReference('2027FCCOXYZ84701')).toBe('XYZ');
    expect(getNiveauFromReference('2027FCCOXYZ84701')).toBe('autres');
    expect(getNiveauFromReference('REF-001')).toBe('autres');
  });

  it('renvoie null sans référence', () => {
    expect(getNiveauFromReference(undefined)).toBeNull();
    expect(getNiveauFromReference('  ')).toBeNull();
  });
});

describe('options', () => {
  it('liste les niveaux dans l’ordre du cursus', () => {
    const labels = getAllNiveauOptions().map(o => o.label);
    expect(labels.indexOf('Pratiquant initié')).toBeLessThan(labels.indexOf('Initiateur 1er degré – formation'));
    expect(labels.indexOf('Initiateur 1er degré – certification')).toBeLessThan(labels.indexOf('Initiateur 2e degré – formation'));
  });

  it('ne propose que les niveaux présents, sans doublon', () => {
    expect(getNiveauOptionsFromFormations([
      { reference: '2027SNSMINT84701' },
      { reference: '2027FCCOPPE84712' },
      { reference: '2027VMVMPPV84701' },
      { reference: 'REF-001' },
    ]).map(o => o.value)).toEqual(['pratiquant-perfectionne', 'initiateur-1-certification', 'autres']); // REF-001 → autres
  });

  it('libellés et validation', () => {
    expect(getNiveauLabel('recyclage')).toBe('Recyclage (initiateur, qualification)');
    expect(getNiveauLabel('autres')).toBe('Autres formations');
    expect(isKnownNiveau('ufc')).toBe(true);
    expect(isKnownNiveau('INT')).toBe(false);
  });
});

describe('filterFormationsByNiveaux', () => {
  const formations = [
    { reference: '2027SNSMINT84701' },
    { reference: '2027SNSMINI84701' },
    { reference: '2027SNSMRIN84701' },
    { reference: 'REF-001' },
  ];

  it('ne filtre rien sans niveau sélectionné', () => {
    expect(filterFormationsByNiveaux(formations, [])).toBe(formations);
    expect(filterFormationsByNiveaux(formations, undefined)).toBe(formations);
  });

  it('une formation au code inconnu reste trouvable via « Autres formations »', () => {
    const list = [{ reference: '2027FCCOXYZ84701' }, { reference: '2027SNSMINT84701' }];
    expect(filterFormationsByNiveaux(list, ['autres']).map(f => f.reference)).toEqual(['2027FCCOXYZ84701']);
    expect(getNiveauOptionsFromFormations(list).map(o => o.value)).toEqual(['initiateur-1-certification', 'autres']);
  });

  it('garde uniquement les niveaux choisis (cas de l’issue #31 : la certification seule)', () => {
    expect(filterFormationsByNiveaux(formations, ['initiateur-1-certification']).map(f => f.reference))
      .toEqual(['2027SNSMINT84701']);
  });
});
