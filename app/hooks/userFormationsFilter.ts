import { useState, useEffect } from 'react';
import { Formation } from "@/app/types/formation";
import { formatFilters, sortFormations } from '@/lib/formationFilter';

export type Filters = {
  searchQuery: string;
  location: string;
  discipline: string;
  organisateur: string;
  startDate: string;
  endDate: string;
  availableOnly: boolean;
  showPastFormations: boolean;
};

export function useFormationFilters(formations: Formation[], sortOption: string) {
  const [filters, setFilters] = useState<Filters>({
    searchQuery: "",
    location: "",
    discipline: "",
    organisateur: "",
    startDate: "",
    endDate: "",
    availableOnly: false,
    showPastFormations: false,
  });
  const [filteredFormations, setFilteredFormations] = useState(formations);

  useEffect(() => {
    const filtered = formatFilters(formations, filters);
    const sorted = sortFormations(filtered, sortOption);
    setFilteredFormations(sorted);
  }, [formations, filters, sortOption]);

  return {
    filters,
    setFilters,
    filteredFormations
  };
}