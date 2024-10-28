/* eslint @typescript-eslint/no-explicit-any: 0 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from './notifications.service';
import { UserService } from './users.service';
import { EmailService } from './email.service';
import { sql } from '@vercel/postgres';
import { Formation } from '@/types/formation';

// Données de test
const testFormations: Formation[] = [
  {
    reference: 'TEST123ESCA',
    titre: 'Formation Test Escalade',
    discipline: 'Escalade',
    informationStagiaire: 'Formation découverte escalade en falaise.',
    nombreParticipants: 8,
    placesRestantes: 5,
    tarif: 250,
    lieu: 'Chamonix',
    organisateur: 'CAF Chamonix',
    responsable: 'Jean Dupont',
    emailContact: 'jean.dupont@example.com',
    dates: ['2024-07-01', '2024-07-05'],
    documents: [
      {
        type: 'inscription',
        nom: 'Formulaire d\'inscription',
        url: 'https://example.com/docs/inscription-escalade.pdf'
      }
    ],
    hebergement: 'REFUGE FFCAM',
    firstSeenAt: new Date().toISOString()
  },
  {
    reference: 'TEST456ALPI',
    titre: 'Stage Alpinisme Initiation',
    discipline: 'Alpinisme',
    informationStagiaire: 'Stage d\'initiation à l\'alpinisme.',
    nombreParticipants: 6,
    placesRestantes: 3,
    tarif: 450,
    lieu: 'Argentière',
    organisateur: 'CAF Haute-Savoie',
    responsable: 'Marie Martin',
    emailContact: 'marie.martin@example.com',
    dates: ['2024-07-15', '2024-07-20'],
    documents: [
      {
        type: 'inscription',
        nom: 'Dossier d\'inscription',
        url: 'https://example.com/docs/inscription-alpinisme.pdf'
      }
    ],
    hebergement: 'REFUGE FFCAM',
    firstSeenAt: new Date().toISOString()
  },
  {
    reference: 'TEST789SKI',
    titre: 'Ski de Randonnée Perfectionnement',
    discipline: 'Ski de Randonnée',
    informationStagiaire: 'Stage de perfectionnement en ski de randonnée.',
    nombreParticipants: 6,
    placesRestantes: 2,
    tarif: 380,
    lieu: 'La Grave',
    organisateur: 'CAF Briançon',
    responsable: 'Pierre Durand',
    emailContact: 'pierre.durand@example.com',
    dates: ['2024-01-10', '2024-01-15'],
    documents: [],
    hebergement: 'GITE',
    firstSeenAt: new Date().toISOString()
  }
];

// Mock des dépendances
vi.mock('@vercel/postgres', () => ({
  sql: {
    query: vi.fn(),
  }
}));

vi.mock('./users', () => ({
  UserService: {
    getUsersToNotifyForDiscipline: vi.fn(),
    updateLastNotified: vi.fn(),
  }
}));

vi.mock('./email.service', () => ({
  EmailService: {
    sendEmail: vi.fn(),
  }
}));

describe('NotificationService', () => {
  // Users de test
  const mockUsers = ['user1@test.com', 'user2@test.com'];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Configuration par défaut des mocks
    (sql.query as any).mockResolvedValue({ rows: [] });
    (UserService.getUsersToNotifyForDiscipline as any).mockResolvedValue(mockUsers);
    (UserService.updateLastNotified as any).mockResolvedValue();
    (EmailService.sendEmail as any).mockResolvedValue();
  });

  describe('notifyNewFormation', () => {
    it('devrait notifier tous les utilisateurs éligibles', async () => {
      // Mock: aucune notification récente
      (sql.query as any).mockResolvedValue({ 
        rows: [{ last_notified_at: null }] 
      });

      const result = await NotificationService.notifyBatchNewFormations(testFormations);

      expect(result.usersNotified).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(EmailService.sendEmail).toHaveBeenCalledTimes(2);
      expect(UserService.updateLastNotified).toHaveBeenCalledTimes(2);
    });

    it('devrait personnaliser le contenu de l\'email selon la discipline', async () => {
      await NotificationService.notifyNewFormation(testFormations[0]); // Escalade
      await NotificationService.notifyNewFormation(testFormations[1]); // Alpinisme

      const emailCalls = (EmailService.sendEmail as any).mock.calls;
      
      // Vérifie le contenu de l'email pour l'escalade
      expect(emailCalls[0][0].subject).toContain('Escalade');
      expect(emailCalls[0][0].html).toContain('Formation Test Escalade');
      
      // Vérifie le contenu de l'email pour l'alpinisme
      expect(emailCalls[2][0].subject).toContain('Alpinisme');
      expect(emailCalls[2][0].html).toContain('Stage Alpinisme Initiation');
    });

    it('ne devrait pas notifier les utilisateurs déjà notifiés récemment', async () => {
      // Mock: notification récente (moins de 24h)
      const recentDate = new Date();
      (sql.query as any).mockResolvedValue({ 
        rows: [{ last_notified_at: recentDate }] 
      });

      const result = await NotificationService.notifyNewFormation(testFormations[0]);

      expect(result.usersNotified).toBe(0);
      expect(EmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs d\'envoi d\'email', async () => {
      (EmailService.sendEmail as any).mockRejectedValue(new Error('Email error'));

      const result = await NotificationService.notifyNewFormation(testFormations[0]);

      expect(result.usersNotified).toBe(0);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toContain('Email error');
    });
  });

  describe('notifyBatchNewFormations', () => {
    it('devrait traiter un lot de formations', async () => {
      const results = await NotificationService.notifyBatchNewFormations(testFormations);

      expect(results).toHaveLength(testFormations.length);
      results.forEach(result => {
        expect(result.usersNotified).toBe(2);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('devrait continuer même si une formation échoue', async () => {
      // Mock: la première formation échoue
      (UserService.getUsersToNotifyForDiscipline as any)
        .mockRejectedValueOnce(new Error('Test error'))
        .mockResolvedValue(mockUsers);

      const results = await NotificationService.notifyBatchNewFormations(testFormations);

      expect(results).toHaveLength(testFormations.length);
      expect(results[0].errors).toHaveLength(1);
      expect(results[1].usersNotified).toBe(2);
      expect(results[2].usersNotified).toBe(2);
    });

    it('devrait respecter la limite de notification par discipline', async () => {
      // Mock: notification récente pour Escalade, mais pas pour Alpinisme
      (sql.query as any)
        .mockResolvedValueOnce({ rows: [{ last_notified_at: new Date() }] }) // Escalade
        .mockResolvedValueOnce({ rows: [{ last_notified_at: null }] })      // Alpinisme
        .mockResolvedValueOnce({ rows: [{ last_notified_at: null }] });     // Ski

      const results = await NotificationService.notifyBatchNewFormations([
        testFormations[0], // Escalade
        testFormations[1], // Alpinisme
        testFormations[2]  // Ski
      ]);

      expect(results[0].usersNotified).toBe(0);  // Escalade: déjà notifié
      expect(results[1].usersNotified).toBe(2);  // Alpinisme: notifié
      expect(results[2].usersNotified).toBe(2);  // Ski: notifié
    });
  });
});