import { useState, useEffect } from 'react';
import { Formation } from "@/types/formation";
import { formatFilters, sortFormations } from '@/lib/formationFilter';

export type Filters = {
  searchQueryInput: string;
  location: string;
  discipline: string;
  organisateur: string;
  startDate: string;
  endDate: string;
  availableOnly: boolean;
  showPastFormations: boolean;
};

export function useFormationFilters(formations: Formation[], sortOption: string, searchParams: URLSearchParams) {
  const initialFilters: Filters = {
    searchQueryInput: searchParams.get("searchQuery") || "",
    location: searchParams.get("location") || "",
    discipline: searchParams.get("discipline") || "",
    organisateur: searchParams.get("organisateur") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    availableOnly: true,
    showPastFormations: searchParams.get("showPastFormations") === "true",
  };
  console.log(initialFilters);
  const [filters, setFilters] = useState<Filters>(initialFilters);
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