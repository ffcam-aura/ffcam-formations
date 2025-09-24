import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Home from '@/app/(public)/page'

// Mock des données avec toutes les propriétés nécessaires
const mockFormations = [
  {
    id: 1,
    titre: "Formation Mathématiques",
    lieu: "Paris",
    discipline: "Mathématiques",
    organisateur: "Org1",
    date: "2024-05-01",
    dates: ["2024-05-01", "2024-05-02"], // Ajout des dates
    placesDisponibles: 5,
    description: "Description de la formation",
    duree: "2 jours",
    modalites: "Présentiel",
    cout: "500€",
    contact: "contact@org1.fr",
    publicVise: "Enseignants",
    objectifs: "Objectifs de la formation",
    contenus: "Contenus de la formation"
  },
  {
    id: 2,
    titre: "Formation Physique",
    lieu: "Lyon",
    discipline: "Physique",
    organisateur: "Org2",
    date: "2024-06-01",
    dates: ["2024-06-01", "2024-06-02"], // Ajout des dates
    placesDisponibles: 0,
    description: "Description de la formation",
    duree: "2 jours",
    modalites: "Distanciel",
    cout: "400€",
    contact: "contact@org2.fr",
    publicVise: "Enseignants",
    objectifs: "Objectifs de la formation",
    contenus: "Contenus de la formation"
  }
]

// Mock des hooks
vi.mock('@/hooks/useFormations', () => ({
  useFormations: vi.fn()
}))

vi.mock('@/hooks/userFormationsFilter', () => ({
  useFormationFilters: vi.fn(() => ({
    filters: {},
    setFilters: vi.fn(),
    filteredFormations: mockFormations
  }))
}))

// Mock des composants pour éviter les erreurs de rendu
vi.mock('@/components/features/formations/FormationsFilters', () => ({
  default: () => <div data-testid="filters">Filters</div>
}))

vi.mock('@/components/features/formations/FormationList', () => ({
  default: () => <div data-testid="formation-list">Formation List</div>
}))

vi.mock('@/components/features/formations/FormationsHeader', () => ({
  FormationsHeader: () => <div data-testid="formations-header">Header</div>
}))

vi.mock('@/components/features/formations/FormationsToolbar', () => ({
  FormationsToolbar: () => <div data-testid="formations-toolbar">Toolbar</div>
}))

// Import du mock pour pouvoir contrôler les retours
import { useFormations } from '@/hooks/useFormations'

describe('Home', () => {
  it('should render loading state', () => {
    vi.mocked(useFormations).mockReturnValue({
      formations: [],
      lastSyncDate: "",
      loading: true,
      error: null
    })

    render(<Home />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it.skip('should render error state', () => {
    vi.mocked(useFormations).mockReturnValue({
      formations: [],
      lastSyncDate: "",
      loading: false,
      error: "Erreur de chargement"
    })

    render(<Home />)
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument()
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument()
  })

  it('should render formations list when data is loaded', () => {
    vi.mocked(useFormations).mockReturnValue({
      formations: mockFormations,
      lastSyncDate: "2024-03-20",
      loading: false,
      error: null
    })

    render(<Home />)
    
    // Vérifie que le conteneur principal est présent
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveClass('container')

    // Vérifie que les composants principaux sont rendus
    expect(screen.getByTestId('formations-header')).toBeInTheDocument()
    expect(screen.getByTestId('filters')).toBeInTheDocument()
    expect(screen.getByTestId('formations-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('formation-list')).toBeInTheDocument()
  })
})