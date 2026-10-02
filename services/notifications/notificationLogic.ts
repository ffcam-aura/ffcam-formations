import { subHours } from "date-fns";
import { Formation } from "@/types/formation";

/**
 * Fonctions pures pour la logique de notification
 * Séparées pour faciliter les tests unitaires
 */

/** Premier email d'un abonné : formations apparues dans les dernières 24h. */
export const NOTIFICATION_WINDOW_HOURS = 24;
/** Rattrapage maximal : on ne remonte jamais plus loin, même si le dernier email est plus ancien. */
export const NOTIFICATION_LOOKBACK_HOURS = 72;

/** Début de la fenêtre de rattrapage. */
export const getLookbackStart = (now: Date): Date => subHours(now, NOTIFICATION_LOOKBACK_HOURS);

/**
 * À partir de quand envoyer les nouveautés à un abonné : depuis son dernier email
 * (sans remonter au-delà de 72h), ou depuis 24h s'il n'en a encore jamais reçu.
 *
 * Partir du dernier email plutôt que d'une fenêtre fixe de 24h évite de perdre les
 * formations d'un jour où l'abonné n'a rien reçu (abonné notifié la veille, envoi en
 * échec, run sauté), sans renvoyer une formation déjà envoyée. Le rattrapage suppose
 * un premier email : sans date de dernier email, on s'en tient aux dernières 24h.
 */
export const getNotifiableSince = (lastNotifiedAt: Date | null | undefined, now: Date): Date => {
  if (!lastNotifiedAt) return subHours(now, NOTIFICATION_WINDOW_HOURS);
  const lookbackStart = getLookbackStart(now);
  return lastNotifiedAt > lookbackStart ? lastNotifiedAt : lookbackStart;
};

/** Formations d'une discipline apparues strictement après `since`. */
export const filterFormationsSince = (
  formations: Formation[],
  discipline: string,
  since: Date
): Formation[] =>
  formations.filter(f =>
    f.discipline === discipline &&
    f.firstSeenAt &&
    new Date(f.firstSeenAt).getTime() > since.getTime()
  );

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