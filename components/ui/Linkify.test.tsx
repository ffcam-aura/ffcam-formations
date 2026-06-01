import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Linkify from './Linkify';

describe('Linkify', () => {
  it('transforme une URL https en lien cliquable', () => {
    render(<Linkify text="Voir https://ffcam.fr/programme pour le détail" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://ffcam.fr/programme');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('préfixe les adresses en www. avec https://', () => {
    render(<Linkify text="Plus d'infos sur www.ffcam.fr" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://www.ffcam.fr');
    expect(link).toHaveTextContent('www.ffcam.fr');
  });

  it("exclut la ponctuation finale collée à l'URL", () => {
    render(<Linkify text="Détails ici : https://ffcam.fr/page." />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://ffcam.fr/page');
    expect(link).toHaveTextContent('https://ffcam.fr/page');
  });

  it('gère plusieurs URLs dans le même texte', () => {
    render(
      <Linkify text="Voir https://a.fr et aussi https://b.fr merci" />
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://a.fr');
    expect(links[1]).toHaveAttribute('href', 'https://b.fr');
  });

  it('ne crée aucun lien quand il n\'y a pas d\'URL', () => {
    render(<Linkify text="Apporter chaussures et casque." />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('ne transforme pas une URL javascript: (sécurité)', () => {
    render(<Linkify text="javascript:alert(1)" />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('conserve le texte autour des liens', () => {
    const { container } = render(
      <Linkify text="Avant https://ffcam.fr après" />
    );
    expect(container.textContent).toBe('Avant https://ffcam.fr après');
  });
});
