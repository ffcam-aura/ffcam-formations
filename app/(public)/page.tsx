"use client";

import { useState } from "react";
import { useFormations } from "@/hooks/useFormations";
import Filters from "@/components/features/formations/FormationsFilters";
import FormationList from "@/components/features/formations/FormationList";
import { ClipLoader } from "react-spinners";
import { useFormationFilters } from "@/hooks/userFormationsFilter";
import { FormationsHeader } from "@/components/features/formations/FormationsHeader";
import { FormationsToolbar } from "@/components/features/formations/FormationsToolbar";

export default function Home() {
  const { formations, lastSyncDate, loading, error } = useFormations();
  const [showIntro, setShowIntro] = useState(true);
  const [sortOption, setSortOption] = useState('date-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const uniqueLocations = Array.from(new Set(formations.map((f) => f.lieu)));
  const uniqueDisciplines = Array.from(new Set(formations.map((f) => f.discipline)));
  const uniqueOrganisateurs = Array.from(new Set(formations.map((f) => f.organisateur)))
    .sort((a, b) => a.localeCompare(b, 'fr'));

  const { filters, setFilters, filteredFormations } = useFormationFilters(formations, sortOption);

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center">
        <ClipLoader color="#3B82F6" size={50} speedMultiplier={0.8} data-testid="spinner" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-grow container mx-auto p-8">
        <div className="border p-6 rounded-lg shadow-lg bg-white text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Une erreur est survenue</h2>
          <p className="text-gray-600">{error}</p>
          <p className="mt-4 text-sm text-gray-500">
            Veuillez actualiser la page ou réessayer plus tard.
          </p>
        </div>
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

      <FormationList formations={filteredFormations} viewMode={viewMode} data-testid="formation-list" />
    </main>
  );
}