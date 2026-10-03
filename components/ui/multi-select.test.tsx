import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { MultiSelect } from './multi-select';

const options = [
  { value: '84', label: 'Auvergne-Rhône-Alpes' },
  { value: '53', label: 'Bretagne' },
  { value: '93', label: "Provence-Alpes-Côte d'Azur" },
];

function Harness({ onChange = vi.fn() }: { onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <>
      <MultiSelect
        id="comites"
        label="Comité régional organisateur"
        placeholder="Comité régional organisateur"
        options={options}
        value={value}
        onChange={(v) => { setValue(v); onChange(v); }}
      />
      <button type="button">ailleurs</button>
    </>
  );
}

describe('MultiSelect', () => {
  it("garde « +N » visible à côté d'un libellé tronqué et donne la liste complète au survol", () => {
    render(
      <MultiSelect
        id="comites"
        label="Comité régional organisateur"
        placeholder="Comité régional organisateur"
        options={options}
        value={['93', '84']}
        onChange={vi.fn()}
      />
    );

    // « +1 » dans son propre élément : la troncature du libellé ne peut plus le masquer
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Comité régional organisateur/ }))
      .toHaveAttribute('title', "Auvergne-Rhône-Alpes, Provence-Alpes-Côte d'Azur");
  });

  it('affiche le placeholder puis ouvre la liste au clic', () => {
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Comité régional organisateur' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('permet plusieurs choix et résume la sélection', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Comité régional organisateur' }));
    fireEvent.click(screen.getByLabelText('Auvergne-Rhône-Alpes'));
    fireEvent.click(screen.getByLabelText('Bretagne'));

    expect(onChange).toHaveBeenLastCalledWith(['84', '53']);
    expect(screen.getByRole('button', { name: /Comité régional organisateur/ })).toHaveTextContent('Auvergne-Rhône-Alpes+1');
  });

  it('désélectionne tout', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Comité régional organisateur' }));
    fireEvent.click(screen.getByLabelText('Bretagne'));
    fireEvent.click(screen.getByRole('button', { name: 'Tout désélectionner' }));

    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByLabelText('Bretagne')).not.toBeChecked();
  });

  it('se ferme avec Échap et au clic extérieur', () => {
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Comité régional organisateur' });
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    fireEvent.mouseDown(screen.getByRole('button', { name: 'ailleurs' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('se ferme quand le focus sort du composant (Tab)', () => {
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Comité régional organisateur' });
    fireEvent.click(button);
    const checkbox = screen.getByLabelText('Bretagne');
    // focus encore dans le composant : reste ouvert
    fireEvent.blur(button, { relatedTarget: checkbox });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    // focus vers un élément extérieur : se ferme
    fireEvent.blur(checkbox, { relatedTarget: screen.getByRole('button', { name: 'ailleurs' }) });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('n’annonce pas de menu (aria-haspopup) pour une liste de cases à cocher', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Comité régional organisateur' })).not.toHaveAttribute('aria-haspopup');
  });

  it('coche une option en cliquant sur son texte sans refermer la liste (régression revue #33)', () => {
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Comité régional organisateur' });
    fireEvent.click(button);
    // mousedown sur le libellé : le bouton perd le focus sans nouvel élément focalisé
    const text = screen.getByText('Bretagne');
    fireEvent.mouseDown(text);
    fireEvent.blur(button, { relatedTarget: null });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(text);
    expect(screen.getByLabelText('Bretagne')).toBeChecked();
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
