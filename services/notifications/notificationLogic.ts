import { Formation } from "@/types/formation";
import { isSameDay } from "date-fns";

/**
 * Fonctions pures pour la logique de notification
 * Séparées pour faciliter les tests unitaires
 */

/**
 * Filtre les formations du jour pour une discipline donnée
 */
export const filterTodaysFormations = (
  formations: Formation[],
  discipline: string,
  today: Date
): Formation[] => {
  return formations.filter(f =>
    f.discipline === discipline &&
    f.firstSeenAt &&
    isSameDay(new Date(f.firstSeenAt), today)
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

/**
 * Prépare une date pour la comparaison (début de journée)
 */
export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};