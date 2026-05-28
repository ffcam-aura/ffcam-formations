import { Formation } from "@/types/formation";

/**
 * Fonctions pures pour la logique de notification
 * Séparées pour faciliter les tests unitaires
 */

export const NOTIFICATION_WINDOW_HOURS = 24;

/**
 * Filtre les formations récemment apparues pour une discipline donnée.
 *
 * Fenêtre glissante sur `first_seen_at` (24h par défaut) plutôt que « même jour
 * calendaire » : une formation captée par une sync hors créneau (ex: en soirée)
 * reste notifiable au run suivant. Le throttle par utilisateur (last_notified_at)
 * évite les doublons.
 */
export const filterRecentFormations = (
  formations: Formation[],
  discipline: string,
  now: Date,
  windowHours: number = NOTIFICATION_WINDOW_HOURS
): Formation[] => {
  const cutoff = now.getTime() - windowHours * 60 * 60 * 1000;
  return formations.filter(f =>
    f.discipline === discipline &&
    f.firstSeenAt &&
    new Date(f.firstSeenAt).getTime() >= cutoff
  );
};

/**
 * Détermine si un utilisateur doit être notifié en fonction du temps écoulé
 */
export const shouldNotifyBasedOnTime = (
  lastNotifiedAt: Date | null | undefined,
  currentTime: Date
): boolean => {
  if (!lastNotifiedAt) return true;

  const timeSinceLastNotification = currentTime.getTime() - lastNotifiedAt.getTime();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  return timeSinceLastNotification > TWENTY_FOUR_HOURS;
};

/**
 * Groupe les formations par utilisateur
 */
export interface UserFormationData {
  userId: string;
  email: string;
  formations: Formation[];
}

export interface UserNotificationMap {
  email: string;
  formations: Formation[];
}

export const groupFormationsByUser = (
  userFormations: UserFormationData[]
): Map<string, UserNotificationMap> => {
  const map = new Map<string, UserNotificationMap>();

  for (const { userId, email, formations } of userFormations) {
    if (!map.has(userId)) {
      map.set(userId, { email, formations: [] });
    }

    const userData = map.get(userId)!;
    userData.formations.push(...formations);
  }

  return map;
};

/**
 * Extrait les disciplines uniques d'une liste de formations
 */
export const extractUniqueDisciplines = (formations: Formation[]): string[] => {
  return [...new Set(formations.map(f => f.discipline))];
};