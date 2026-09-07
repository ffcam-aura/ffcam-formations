import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Home from '@/app/(public)/page'
import { makeFormation } from '@/test/factories'

const mockFormations = [
  makeFormation({ reference: 'MATH-1', titre: 'Formation Mathématiques', lieu: 'Paris', discipline: 'Mathématiques', organisateur: 'Org1' }),
  makeFormation({ reference: 'PHYS-1', titre: 'Formation Physique', lieu: 'Lyon', discipline: 'Physique', organisateur: 'Org2', placesRestantes: 0 }),
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
      error: null,
      retry: undefined,
      retryCount: 0
    })

    render(<Home />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it.skip('should render error state', () => {
    vi.mocked(useFormations).mockReturnValue({
      formations: [],
      lastSyncDate: "",
      loading: false,
      error: { message: "Erreur de chargement", type: 'server', canRetry: true },
      retry: vi.fn(),
      retryCount: 0
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
      error: null,
      retry: undefined,
      retryCount: 0
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