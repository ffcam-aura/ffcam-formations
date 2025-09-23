"use client";

import { useState, useEffect } from "react";
import { useFormations } from "@/hooks/useFormations";
import Filters from "@/components/features/formations/FormationsFilters";
import FormationList from "@/components/features/formations/FormationList";
import { ClipLoader } from "react-spinners";
import { useFormationFilters } from "@/hooks/userFormationsFilter";
import { FormationsHeader } from "@/components/features/formations/FormationsHeader";
import { FormationsToolbar } from "@/components/features/formations/FormationsToolbar";
import { ErrorDisplay } from "@/components/ui/error-display";

export default function Home() {
  const { formations, lastSyncDate, loading, error, retry, retryCount } = useFormations();
  const [showIntro, setShowIntro] = useState(true);
  const [sortOption, setSortOption] = useState('date-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loadingMessage, setLoadingMessage] = useState(0);

  const loadingMessages = [
    "Chargement des formations...",
    "Récupération des données...",
    "Préparation de l'affichage...",
    "C'est presque prêt...",
  ];

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setLoadingMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  const uniqueLocations = Array.from(new Set(formations.map((f) => f.lieu)));
  const uniqueDisciplines = Array.from(new Set(formations.map((f) => f.discipline)));
  const uniqueOrganisateurs = Array.from(new Set(formations.map((f) => f.organisateur)))
    .sort((a, b) => a.localeCompare(b, 'fr'));

  const { filters, setFilters, filteredFormations } = useFormationFilters(formations, sortOption);

  if (loading) {
    return (
      <main className="flex-grow flex flex-col items-center justify-center gap-4">
        <ClipLoader color="#3B82F6" size={50} speedMultiplier={0.8} data-testid="spinner" />
        <p className="text-gray-600 animate-fade-in">
          {loadingMessages[loadingMessage]}
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-grow container mx-auto p-8">
        <ErrorDisplay 
          error={error}
          onRetry={retry}
          retryCount={retryCount}
          isRetrying={loading}
        />
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto p-8">
      <FormationsHeader
        data-testid="formations-header"
        showIntro={showIntro}
        setShowIntro={setShowIntro}
        lastSyncDate={lastSyncDate}
      />

      <Filters
       data-testid="filters"
        onFilterChange={setFilters}
        locations={uniqueLocations}
        disciplines={uniqueDisciplines}
        organisateurs={uniqueOrganisateurs}
        showPastFormations={filters.showPastFormations}
      />

      <FormationsToolbar 
      data-testid="formations-toolbar"
        formationCount={filteredFormations.length}
        sortOption={sortOption}
        setSortOption={setSortOption}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {filteredFormations.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-.785-6.172-2.109M15.293 6.707L17 5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune formation trouvée
            </h3>
            <p className="text-gray-500 mb-4">
              Aucune formation ne correspond à vos critères de recherche actuels.
            </p>
            <button 
              onClick={() => setFilters({})}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <FormationList formations={filteredFormations} viewMode={viewMode} data-testid="formation-list" />
      )}
    </main>
  );
}