import { Formation } from '@/types/formation';

/**
 * Formation status type
 */
export type FormationStatus = 'available' | 'urgent' | 'complete';

/**
 * Check if a formation has limited places (3 or less)
 * @param formation Formation object
 * @returns boolean indicating if formation is urgent
 */
export function isUrgentFormation(formation: Formation): boolean {
  return formation.placesRestantes !== null &&
         formation.placesRestantes > 0 &&
         formation.placesRestantes <= 3;
}

/**
 * Check if a formation is complete (no places left)
 * @param formation Formation object
 * @returns boolean indicating if formation is complete
 */
export function isCompleteFormation(formation: Formation): boolean {
  return formation.placesRestantes === 0;
}

/**
 * Get the status of a formation
 * @param formation Formation object
 * @returns FormationStatus
 */
export function getFormationStatus(formation: Formation): FormationStatus {
  if (isCompleteFormation(formation)) {
    return 'complete';
  }
  if (isUrgentFormation(formation)) {
    return 'urgent';
  }
  return 'available';
}

/**
 * Get a human-readable message for available places
 * @param formation Formation object
 * @returns string message about available places
 */
export function getAvailablePlacesMessage(formation: Formation): string {
  if (formation.placesRestantes === null) {
    return `${formation.nombreParticipants} participants max`;
  }

  if (formation.placesRestantes === 0) {
    return 'Complet';
  }

  const plural = formation.placesRestantes > 1;

  if (isUrgentFormation(formation)) {
    return `${formation.placesRestantes} place${plural ? 's' : ''} restante${plural ? 's' : ''}`;
  }

  return `${formation.placesRestantes} places disponibles`;
}

/**
 * Get display information for formation status badge
 * @param formation Formation object
 * @returns Badge information or null if no badge should be shown
 */
export function getStatusBadgeInfo(formation: Formation): {
  text: string;
  className: string;
  animate?: boolean;
} | null {
  if (isCompleteFormation(formation)) {
    return {
      text: 'Complet',
      className: 'bg-red-100 text-red-700'
    };
  }

  if (isUrgentFormation(formation)) {
    return {
      text: `${formation.placesRestantes} places`,
      className: 'bg-orange-100 text-orange-700',
      animate: true
    };
  }

  return null;
}