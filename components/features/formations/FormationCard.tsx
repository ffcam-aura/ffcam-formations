'use client';

import Link from "next/link";
import { Formation } from "@/types/formation";
import { getFormationUrl } from "@/utils/slug";
import { CalendarDays, MapPin, Euro, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { formatDateRange } from "@/utils/dateUtils";
import { isUrgentFormation, isCompleteFormation } from "@/utils/formationStatus";
import { useNavigation } from "@/contexts/NavigationContext";

export default function FormationCard({ formation }: { formation: Formation }) {
  const isUrgent = isUrgentFormation(formation);
  const isComplete = isCompleteFormation(formation);
  const { startNavigation } = useNavigation();

  return (
    <motion.div
      className="h-full flex flex-col bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}>
      {/* Header avec discipline et badges */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
            {formation.discipline}
          </span>

          {/* Badges de statut */}
          <div className="flex gap-2">
            {isComplete && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                Complet
              </span>
            )}
            {isUrgent && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full animate-pulse">
                {formation.placesRestantes} places
              </span>
            )}
          </div>
        </div>

        {/* Titre - hauteur fixe */}
        <h3 className="text-lg font-bold text-gray-900 mb-4 min-h-[3.5rem] line-clamp-2">
          <Link
            href={getFormationUrl(formation)}
            onClick={startNavigation}
            className="hover:text-primary-600 transition-colors"
          >
            {formation.titre}
          </Link>
        </h3>
      </div>

      {/* Corps de la carte - flex-grow pour occuper l'espace disponible */}
      <div className="flex-grow flex flex-col px-5">
        {/* Infos essentielles */}
        <div className="space-y-2.5">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formation.lieu}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <CalendarDays className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>{formatDateRange(formation.dates, 'long')}</span>
          </div>

          <div className="flex items-center text-sm">
            <Euro className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-gray-900">{formation.tarif}€</span>
          </div>
        </div>

        {/* Alerte si peu de places - toujours à la même position */}
        <div className="mt-4 mb-4">
          {isUrgent && (
            <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-xs text-orange-700">
                <AlertCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />
                <span className="font-medium">Attention : dernières places disponibles !</span>
              </div>
            </div>
          )}
          {formation.placesRestantes !== null && !isComplete && !isUrgent && (
            <div className="text-xs text-gray-500 text-center">
              {formation.placesRestantes} places disponibles
            </div>
          )}
        </div>
      </div>

      {/* Bouton CTA avec animation */}
      <div className="p-5 pt-0 mt-auto">
        <motion.div whileHover="hover" whileTap={{ scale: 0.98 }}>
          <Link
            href={getFormationUrl(formation)}
            onClick={startNavigation}
            className="relative inline-flex items-center justify-center w-full px-4 py-3 sm:py-2.5 min-h-[44px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg overflow-hidden group touch-manipulation"
          >
            <span className="relative z-10 flex items-center">
              Plus de détails
              <motion.span
                className="ml-2 inline-flex"
                variants={{
                  hover: { x: 5 }
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-700"
              initial={{ x: "-100%" }}
              variants={{
                hover: { x: 0 }
              }}
              transition={{ type: "tween", duration: 0.3 }}
            />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}