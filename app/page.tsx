"use client";

import { useFormations } from "@/app/hooks/useFormations";
import Navbar from "@/app/components/Navbar";
import Filters from "@/app/components/Filters";
import FormationList from "@/app/components/FormationList";
import Footer from "@/app/components/Footer";
import { LayoutGrid, List, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react";
import { format, parseISO, isAfter } from "date-fns";
import { ClipLoader } from "react-spinners";
import { Formation } from "@/app/types/formation";
import { Alert, AlertDescription } from "@/components/ui/alert";

const sortOptions = [
  { value: 'date-asc', label: 'Date (plus ancien)' },
  { value: 'date', label: 'Date (plus récent)' },
  { value: 'price', label: 'Prix (croissant)' },
  { value: 'price-desc', label: 'Prix (décroissant)' },
  { value: 'title', label: 'Titre (A-Z)' },
  { value: 'location', label: 'Lieu (A-Z)' }
];

type Filters = {
  searchQuery: string;
  location: string;
  discipline: string;
  startDate: string;
  endDate: string;
  availableOnly: boolean;
  showPastFormations: boolean;
};

export default function Home() {
  const { formations, lastSyncDate, loading, error } = useFormations();
  const [filteredFormations, setFilteredFormations] = useState(formations);
  const [sortOption, setSortOption] = useState('date-asc');
  const [showIntro, setShowIntro] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({
    searchQuery: "",
    location: "",
    discipline: "",
    startDate: "",
    endDate: "",
    availableOnly: false,
    showPastFormations: false,
  });

  const uniqueLocations = Array.from(new Set(formations.map((f) => f.lieu)));
  const uniqueDisciplines = Array.from(new Set(formations.map((f) => f.discipline)));

  // Fonction de tri
  const sortFormations = (formations: Formation[], option: string) => {
    const sorted = [...formations];

    switch (option) {
      case 'date':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.dates[0] || 0);
          const dateB = new Date(b.dates[0] || 0);
          return dateB.getTime() - dateA.getTime();
        });

      case 'date-asc':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.dates[0] || 0);
          const dateB = new Date(b.dates[0] || 0);
          return dateA.getTime() - dateB.getTime();
        });

      case 'price':
        return sorted.sort((a, b) =>
          (a.tarif || 0) - (b.tarif || 0)
        );

      case 'price-desc':
        return sorted.sort((a, b) =>
          (b.tarif || 0) - (a.tarif || 0)
        );

      case 'title':
        return sorted.sort((a, b) =>
          a.titre.localeCompare(b.titre, 'fr')
        );

      case 'location':
        return sorted.sort((a, b) =>
          a.lieu.localeCompare(b.lieu, 'fr')
        );

      default:
        return sorted;
    }
  };

  // Appliquer les filtres à chaque changement
  useEffect(() => {
    const applyFiltersAndSort = () => {
      const today = new Date();

      const filtered = formations.filter((formation) => {
        // Recherche par titre ou description
        const matchesSearchQuery = filters.searchQuery
          ? formation.titre.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          formation.informationStagiaire.toLowerCase().includes(filters.searchQuery.toLowerCase())
          : true;

        // Filtrer par lieu
        const matchesLocation = filters.location ? formation.lieu === filters.location : true;

        // Filtrer par discipline
        const matchesDiscipline = filters.discipline ? formation.discipline === filters.discipline : true;

        // Filtrer par plage de dates
        const isInDateRange =
          filters.startDate && filters.endDate
            ? formation.dates.some((date) => {
              const formationDate = parseISO(date);
              const startDate = parseISO(filters.startDate);
              const endDate = parseISO(filters.endDate);
              return formationDate >= startDate && formationDate <= endDate;
            })
            : true;

        // Filtrer par disponibilité des places
        const hasAvailablePlaces = filters.availableOnly
          ? formation.placesRestantes === null || formation.placesRestantes > 0
          : true;

        // Filtrer les formations passées ou futures
        const isFutureFormation = formation.dates.some((date) => {
          if (!date) return false;
          const formationDate = parseISO(date);
          return !isNaN(formationDate.getTime()) && isAfter(formationDate, today);
        });
        const shouldShowFormation = filters.showPastFormations ? true : isFutureFormation;

        return (
          matchesSearchQuery &&
          matchesLocation &&
          matchesDiscipline &&
          isInDateRange &&
          hasAvailablePlaces &&
          shouldShowFormation
        );
      });

      // Appliquer le tri après le filtrage
      const sortedAndFiltered = sortFormations(filtered, sortOption);
      setFilteredFormations(sortedAndFiltered);
    };

    applyFiltersAndSort();
  }, [formations, filters, sortOption]);

  const handleFilterChange = useCallback((updatedFilters: Filters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...updatedFilters,
    }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <ClipLoader
            color="#3B82F6"
            size={50}
            speedMultiplier={0.8}
          />
        </main>
        <Footer lastSyncDate={null} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-8">
          <div className="border p-6 rounded-lg shadow-lg bg-white text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Une erreur est survenue</h2>
            <p className="text-gray-600">{error}</p>
            <p className="mt-4 text-sm text-gray-500">
              Veuillez actualiser la page ou réessayer plus tard.
            </p>
          </div>
        </main>
        <Footer lastSyncDate={null} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-8">
        {showIntro && (
          <Alert className="mb-6 pr-12 relative">
            <AlertDescription className="text-sm text-muted-foreground">
              Explorez facilement toutes les formations FFCAM en un seul endroit !
              Notre outil récupère les formations publiées sur le site de la FFCAM pour simplifier votre recherche. Nous vous proposerons bientôt des alertes personnalisées selon vos disciplines préférées. 🏔️
            </AlertDescription>
            <button
              onClick={() => setShowIntro(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fermer le message"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        )}
        <h2 className="text-3xl font-bold mb-4 text-center text-primary">
          Découvrez les formations de la FFCAM
        </h2>
        <p className="text-center text-sm text-neutral mb-8">
          Dernière synchronisation : {lastSyncDate ? format(parseISO(lastSyncDate), "dd/MM/yyyy 'à' HH:mm") : "Non disponible"}
        </p>

        <Filters
          onFilterChange={handleFilterChange}
          locations={uniqueLocations}
          disciplines={uniqueDisciplines}
          showPastFormations={filters.showPastFormations}
        />

        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {filteredFormations.length} formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
          </p>

          <div className="flex items-center gap-2">
            <select
              onChange={(e) => setSortOption(e.target.value)}
              value={sortOption}
              className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="border rounded-lg overflow-hidden flex bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                aria-label="Vue grille"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                aria-label="Vue liste"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>


        <FormationList formations={filteredFormations} viewMode={viewMode} />
      </main>
      <Footer lastSyncDate={lastSyncDate} />
    </div>
  );
}