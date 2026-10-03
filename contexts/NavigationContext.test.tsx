import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationProvider, useNavigation } from './NavigationContext';

function Lien() {
  const { isNavigating, startNavigation } = useNavigation();
  return (
    <>
      <a href="/formation/x" onClick={(e) => { e.preventDefault(); startNavigation(e); }}>Plus de détails</a>
      <span data-testid="etat">{isNavigating ? 'chargement' : 'repos'}</span>
    </>
  );
}

const rendu = () => render(<NavigationProvider><Lien /></NavigationProvider>);

describe('NavigationContext', () => {
  it("affiche le chargement pour un clic simple", () => {
    rendu();
    fireEvent.click(screen.getByText('Plus de détails'));
    expect(screen.getByTestId('etat')).toHaveTextContent('chargement');
  });

  it.each([
    ['Cmd', { metaKey: true }],
    ['Ctrl', { ctrlKey: true }],
    ['Maj', { shiftKey: true }],
    ['Alt', { altKey: true }],
    ['clic molette', { button: 1 }],
  ])("n'affiche pas le chargement pour %s+clic (ouverture dans un autre onglet)", (_nom, options) => {
    // La page courante ne change pas : l'écran « Chargement » resterait bloqué
    rendu();
    fireEvent.click(screen.getByText('Plus de détails'), options);
    expect(screen.getByTestId('etat')).toHaveTextContent('repos');
  });
});
