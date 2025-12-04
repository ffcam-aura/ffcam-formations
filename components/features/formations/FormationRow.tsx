'use client';

import { memo } from "react";
import Link from "next/link";
import { Formation } from "@/types/formation";
import { CalendarDays, MapPin, Euro, ArrowRight, AlertCircle } from "lucide-react";
import { getFormationUrl } from "@/utils/slug";
import { motion } from "framer-motion";
import { formatDateRange } from "@/utils/dateUtils";
import { isUrgentFormation, isCompleteFormation } from "@/utils/formationStatus";
import { useNavigation } from "@/contexts/NavigationContext";

interface FormationRowProps {
  formation: Formation;
}

function FormationRowComponent({ formation }: FormationRowProps) {
  const isUrgent = isUrgentFormation(formation);
  const isComplete = isCompleteFormation(formation);
  const { startNavigation } = useNavigation();

  return (
    <motion.li
      className="bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 overflow-hidden"
      whileHover={{ x: 4, transition: { duration: 0.2 } }}>
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
                  onClick={startNavigation}
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
                <span className="text-sm whitespace-nowrap">{formatDateRange(formation.dates, 'short')}</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 min-w-[80px]">
                <Euro className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">{formation.tarif}€</span>
              </div>
            </div>
          </div>

          {/* Bouton CTA avec animation */}
          <motion.div className="flex-shrink-0" whileHover="hover" whileTap={{ scale: 0.95 }}>
            <Link
              href={getFormationUrl(formation)}
              onClick={startNavigation}
              className="relative inline-flex items-center px-4 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg overflow-hidden whitespace-nowrap"
            >
              <span className="relative z-10 flex items-center gap-1">
                <span className="hidden sm:inline">Plus de détails</span>
                <span className="sm:hidden">Détails</span>
                <motion.span
                  className="inline-flex"
                  variants={{
                    hover: { x: 3 }
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </span>
            </Link>
          </motion.div>
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
              <span>{formatDateRange(formation.dates, 'short')}</span>
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
    </motion.li>
  );
}

const FormationRow = memo(FormationRowComponent);
export default FormationRow;