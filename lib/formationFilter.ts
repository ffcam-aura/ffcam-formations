import { Filters } from "@/hooks/userFormationsFilter";
import { Formation } from "@/types/formation";
import { parseISO, isAfter } from "date-fns";

export function formatFilters(formations: Formation[], filters: Filters): Formation[] {
  const today = new Date();

  return formations.filter((formation) => {
    // Recherche par titre ou description
    const matchesSearchQuery = filters.searchQueryInput
      ? formation.titre.toLowerCase().includes(filters.searchQueryInput.toLowerCase()) ||
        formation.informationStagiaire.toLowerCase().includes(filters.searchQueryInput.toLowerCase())
      : true;

    // Filtrer par lieu
    const matchesLocation = filters.location ? formation.lieu === filters.location : true;

    // Filtrer par discipline
    const matchesDiscipline = filters.discipline ? formation.discipline === filters.discipline : true;

    // Filtrer par organisateur
    const matchesOrganisateur = filters.organisateur ? formation.organisateur === filters.organisateur : true;

    // Filtrer par plage de dates
    const isInDateRange =
      filters.startDate && filters.endDate
        ? formation.dates.some((date) => {
            // Vérifier si la date existe et est valide
            if (!date) return false;
            
            try {
              const formationDate = parseISO(date);
              const startDate = parseISO(filters.startDate);
              const endDate = parseISO(filters.endDate);
              
              // Vérifier si les dates sont valides
              if (isNaN(formationDate.getTime()) || 
                  isNaN(startDate.getTime()) || 
                  isNaN(endDate.getTime())) {
                return false;
              }
              
              return formationDate >= startDate && formationDate <= endDate;
            } catch (error) {
              console.error(`Erreur lors du parsing de la date: ${date}`, error);
              return false;
            }
          })
        : true;

    // Filtrer par disponibilité des places
    const hasAvailablePlaces = filters.availableOnly
      ? formation.placesRestantes === null || formation.placesRestantes > 0
      : true;

    // Filtrer les formations passées ou futures
    const isFutureFormation = formation.dates.some((date) => {
      if (!date) return false;
      
      try {
        const formationDate = parseISO(date);
        return !isNaN(formationDate.getTime()) && isAfter(formationDate, today);
      } catch (error) {
        console.error(`Erreur lors du parsing de la date: ${date}`, error);
        return false;
      }
    });
    const shouldShowFormation = filters.showPastFormations ? true : isFutureFormation;

    return (
      matchesSearchQuery &&
      matchesLocation &&
      matchesDiscipline &&
      matchesOrganisateur &&
      isInDateRange &&
      hasAvailablePlaces &&
      shouldShowFormation
    );
  });
}

// La fonction sortFormations reste inchangée
export function sortFormations(formations: Formation[], option: string): Formation[] {
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

    case 'publication-date':
      return sorted.sort((a, b) => {
        const publicationDateA = new Date(a.firstSeenAt || 0);
        const publicationDateB = new Date(b.firstSeenAt || 0);
        return publicationDateB.getTime() - publicationDateA.getTime();
      });

    case 'price':
      return sorted.sort((a, b) => (a.tarif || 0) - (b.tarif || 0));

    case 'price-desc':
      return sorted.sort((a, b) => (b.tarif || 0) - (a.tarif || 0));

    case 'title':
      return sorted.sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));

    case 'location':
      return sorted.sort((a, b) => a.lieu.localeCompare(b.lieu, 'fr'));

    default:
      return sorted;
  }
}