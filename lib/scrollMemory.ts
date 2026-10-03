/**
 * Mémorise la position de défilement d'une page au moment où l'on en part (ouverture
 * d'une fiche), pour la rétablir une seule fois au retour sur la même URL.
 *
 * Au retour, la liste s'affiche après un écran de chargement : le navigateur ne sait
 * pas restaurer la position tout seul (Chrome Android s'accrochait au pied de page).
 */
const KEY = 'ffcam:liste-scroll';
const TTL_MS = 30 * 60 * 1000;

type SavedPosition = { url: string; y: number; at: number };

const currentUrl = () => window.location.pathname + window.location.search;

export function saveScrollPosition(): void {
  try {
    const saved: SavedPosition = { url: currentUrl(), y: Math.round(window.scrollY), at: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Stockage indisponible (navigation privée, quota) : on retombera en haut de page
  }
}

/** Position mémorisée pour l'URL courante (lue une seule fois), ou null. */
export function takeScrollPosition(): number | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const saved = JSON.parse(raw) as SavedPosition;
    if (saved.url !== currentUrl() || Date.now() - saved.at > TTL_MS) return null;
    return saved.y;
  } catch {
    return null;
  }
}
