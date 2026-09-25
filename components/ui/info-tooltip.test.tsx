import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoTooltip } from './info-tooltip';

const isVisible = () => !screen.getByRole('tooltip').className.includes('sr-only');

describe('InfoTooltip', () => {
  it('reste ouverte après un tap sur mobile (mouseenter + focus + click)', () => {
    render(<InfoTooltip text="Explication" label="Info" />);
    const button = screen.getByRole('button', { name: 'Info' });
    fireEvent.mouseEnter(button);
    fireEvent.focus(button);
    fireEvent.click(button);
    expect(isVisible()).toBe(true);
  });

  it('se ferme au toucher en dehors et avec Échap', () => {
    render(<><InfoTooltip text="Explication" label="Info" /><p>ailleurs</p></>);
    const button = screen.getByRole('button', { name: 'Info' });
    fireEvent.click(button);
    fireEvent.pointerDown(screen.getByText('ailleurs'));
    expect(isVisible()).toBe(false);

    fireEvent.click(button);
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(isVisible()).toBe(false);
  });

  it('relie le texte au bouton pour les lecteurs d’écran', () => {
    render(<InfoTooltip text="Explication" label="Info" />);
    expect(screen.getByRole('button', { name: 'Info' })).toHaveAccessibleDescription('Explication');
  });
});
