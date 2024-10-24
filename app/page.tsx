"use client";

import { useFormations } from "@/app/hooks/useFormations";
import Navbar from "@/app/components/Navbar";
import Filters from "@/app/components/Filters";
import FormationList from "@/app/components/FormationList";
import Footer from "@/app/components/Footer";
import { useState, useEffect, useCallback } from "react";
import { format, parseISO, isAfter } from "date-fns";

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

  // Appliquer les filtres à chaque changement
  useEffect(() => {
    const applyFilters = () => {
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

      setFilteredFormations(filtered);
    };

    applyFilters();
  }, [formations, filters]);

  const handleFilterChange = useCallback((updatedFilters: Filters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...updatedFilters,
    }));
  }, []);

  const formattedLastSyncDate = lastSyncDate ? format(parseISO(lastSyncDate), "dd/MM/yyyy 'à' HH:mm") : "Non disponible";

  if (loading) {
    return <div>Chargement des formations...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-8">
        <h2 className="text-3xl font-bold mb-4 text-center text-primary">Découvrez nos formations</h2>
        <p className="text-center text-sm text-neutral mb-8">Dernière synchronisation : {formattedLastSyncDate}</p>

        <Filters
          onFilterChange={handleFilterChange}
          locations={uniqueLocations}
          disciplines={uniqueDisciplines}
          showPastFormations={filters.showPastFormations}
        />
        
        {/* Afficher le nombre de formations filtrées */}
        <p className="text-center text-gray-600 mb-4">
          {filteredFormations.length} formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
        </p>

        <FormationList formations={filteredFormations} />
      </main>
      <Footer lastSyncDate={lastSyncDate} />
    </div>
  );
}
