import Link from "next/link";
import { Formation } from "@/types/formation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, MapPin, Euro, ChevronRight, AlertCircle } from "lucide-react";
import { getFormationUrl } from "@/utils/slug";

interface FormationRowProps {
  formation: Formation;
}

export default function FormationRow({ formation }: FormationRowProps) {
  // Format de date court
  const formatDateRange = (dates: string[]): string => {
    if (!dates || dates.length === 0) return "Dates à confirmer";

    const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);

    if (sortedDates.length === 1) {
      return format(firstDate, "d MMM", { locale: fr });
    }

    // Si même mois
    if (firstDate.getMonth() === lastDate.getMonth() && firstDate.getFullYear() === lastDate.getFullYear()) {
      return `${format(firstDate, "d")}-${format(lastDate, "d MMM", { locale: fr })}`;
    }

    // Mois différents
    return `${format(firstDate, "d MMM", { locale: fr })} - ${format(lastDate, "d MMM", { locale: fr })}`;
  };

  const isUrgent = formation.placesRestantes !== null && formation.placesRestantes > 0 && formation.placesRestantes <= 3;
  const isComplete = formation.placesRestantes === 0;

  return (
    <li className="bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Colonne Formation avec badges */}
          <div className="flex-grow flex items-center gap-4">
            {/* Badges et titre */}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                  {formation.discipline}
                </span>
                {isComplete && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    Complet
                  </span>
                )}
                {isUrgent && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full animate-pulse">
                    {formation.placesRestantes} places
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mt-1">
                <Link
                  href={getFormationUrl(formation)}
                  className="hover:text-primary-600 transition-colors"
                >
                  {formation.titre}
                </Link>
              </h3>
            </div>

            {/* Infos alignées - tablette avec infos réduites, desktop avec tout */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
              <div className="flex items-center gap-1.5 text-gray-600 lg:min-w-[200px]">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm truncate">{formation.lieu}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 lg:min-w-[140px]">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span className="text-sm whitespace-nowrap">{formatDateRange(formation.dates)}</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 min-w-[80px]">
                <Euro className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">{formation.tarif}€</span>
              </div>
            </div>
          </div>

          {/* Bouton CTA avec zone de tap mobile-friendly */}
          <div className="flex-shrink-0">
            <Link
              href={getFormationUrl(formation)}
              className="inline-flex items-center px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors group whitespace-nowrap"
            >
              <span className="hidden sm:inline">Plus de détails</span>
              <span className="sm:hidden">Détails</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Infos mobiles uniquement (tablette a les infos inline maintenant) */}
        <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{formation.lieu}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span>{formatDateRange(formation.dates)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Euro className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-900">{formation.tarif}€</span>
            </div>
            {formation.placesRestantes !== null && !isComplete && (
              <div className="flex items-center gap-1.5 text-gray-600">
                {isUrgent ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-700 font-medium">
                      {formation.placesRestantes} place{formation.placesRestantes > 1 ? 's' : ''} restante{formation.placesRestantes > 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">
                    {formation.placesRestantes} places disponibles
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}