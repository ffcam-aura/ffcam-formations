// app/types/user.ts
import { z } from 'zod';

// Schéma pour les préférences de notification par discipline
export const userNotificationPreferenceSchema = z.object({
  discipline: z.string(),
  enabled: z.boolean().default(true),
  lastNotifiedAt: z.string().nullable().optional()
});

// Schéma principal pour l'utilisateur
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  notificationPreferences: z.array(userNotificationPreferenceSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Pour les préférences utilisateur dans la base de données
export const userPreferenceSchema = z.object({
  id: z.number(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

// Types pour les requêtes API de mise à jour des préférences
export const updateNotificationPreferencesSchema = z.object({
  disciplines: z.array(z.string())
});

// Type pour la réponse de getUsersToNotifyForDiscipline
export const userNotificationInfoSchema = z.object({
  userId: z.string(),
  email: z.string().email()
});

// Export des types inférés
export type UserNotificationPreference = z.infer<typeof userNotificationPreferenceSchema>;
export type User = z.infer<typeof userSchema>;
export type UserPreference = z.infer<typeof userPreferenceSchema>;
export type UpdateNotificationPreferencesRequest = z.infer<typeof updateNotificationPreferencesSchema>;
export type UserNotificationInfo = z.infer<typeof userNotificationInfoSchema>;