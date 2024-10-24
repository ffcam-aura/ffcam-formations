import { z } from 'zod';

export const formationDocumentSchema = z.object({
  type: z.string(), // ex: 'inscription', 'cursus'
  nom: z.string(),
  url: z.string().url()
});

export type FormationDocument = z.infer<typeof formationDocumentSchema>;

export const formationSchema = z.object({
  reference: z.string(),
  titre: z.string(),
  dates: z.array(z.string()),
  lieu: z.string(),
  informationStagiaire: z.string(),
  nombreParticipants: z.number(),
  placesRestantes: z.number().nullable(),
  hebergement: z.string(),
  tarif: z.number(),
  discipline: z.string(),
  organisateur: z.string(),
  responsable: z.string(),
  emailContact: z.string().nullable(),
  documents: z.array(formationDocumentSchema).default([]),
  firstSeenAt: z.string()
});

export type Formation = z.infer<typeof formationSchema>;

// Types pour les requêtes API
export type CreateFormationRequest = z.infer<typeof formationSchema>;
export type UpdateFormationRequest = Partial<CreateFormationRequest>;