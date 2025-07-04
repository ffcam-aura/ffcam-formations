#!/usr/bin/env npx tsx
/**
 * Script pour tester le template d'email avec des données mockées
 * Usage: npx tsx scripts/test-email-template.ts
 */

import { EmailTemplateRenderer } from '@/services/notifications/emailTemplate.service';
import { Formation } from '@/types/formation';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Mock data simulant les conditions de production
const mockFormations: Formation[] = [
  {
    reference: 'REF-2025-001',
    titre: 'Initiation Alpinisme - Chamonix',
    dates: ['2025-08-15T00:00:00.000Z', '2025-08-17T00:00:00.000Z'], // Format ISO comme en prod
    lieu: 'Chamonix-Mont-Blanc',
    informationStagiaire: 'Niveau débutant requis. Matériel technique fourni.',
    nombreParticipants: 8,
    placesRestantes: 3,
    hebergement: 'Refuge du Goûter',
    tarif: 450,
    discipline: 'Alpinisme',
    organisateur: 'Club Alpin Français - Section Chamonix',
    responsable: 'Jean Dupont',
    emailContact: 'jean.dupont@ffcam.fr',
    documents: [
      {
        type: 'inscription',
        nom: 'Fiche d\'inscription',
        url: 'https://example.com/inscription.pdf'
      },
      {
        type: 'cursus',
        nom: 'Programme détaillé',
        url: 'https://example.com/programme.pdf'
      }
    ],
    firstSeenAt: '2025-07-03T10:30:00.000Z',
    lastSeenAt: '2025-07-03T10:30:00.000Z'
  },
  {
    reference: 'REF-2025-002',
    titre: 'Escalade Grandes Voies - Verdon',
    dates: ['2025-09-10T00:00:00.000Z'], // Une seule date
    lieu: 'Gorges du Verdon',
    informationStagiaire: 'Niveau 5c minimum en tête. Matériel personnel requis.',
    nombreParticipants: 6,
    placesRestantes: null, // Pas de places restantes spécifiées
    hebergement: 'Camping',
    tarif: 280,
    discipline: 'Escalade',
    organisateur: 'Club Alpin Français - Section Marseille',
    responsable: 'Marie Martin',
    emailContact: null, // Pas d'email de contact
    documents: [],
    firstSeenAt: '2025-07-03T11:15:00.000Z',
    lastSeenAt: '2025-07-03T11:15:00.000Z'
  },
  {
    reference: 'REF-2025-003',
    titre: 'Ski de Randonnée - Initiation',
    dates: [], // Cas problématique : pas de dates
    lieu: 'Vallée de Chamonix',
    informationStagiaire: 'Aucune expérience requise. Formation complète incluse.',
    nombreParticipants: 12,
    placesRestantes: 8,
    hebergement: 'Chalet',
    tarif: 320,
    discipline: 'Ski de randonnée',
    organisateur: 'Club Alpin Français - Section Annecy',
    responsable: 'Pierre Blanc',
    emailContact: 'pierre.blanc@ffcam.fr',
    documents: [
      {
        type: 'information',
        nom: 'Guide du débutant',
        url: 'https://example.com/guide.pdf'
      }
    ],
    firstSeenAt: '2025-07-03T09:45:00.000Z',
    lastSeenAt: '2025-07-03T09:45:00.000Z'
  },
  {
    reference: 'REF-2025-004',
    titre: 'Formation Secours en Montagne',
    dates: ['2025-08-25T00:00:00.000Z', '2025-08-26T00:00:00.000Z', '2025-08-27T00:00:00.000Z'], // Plusieurs dates
    lieu: 'Grenoble',
    informationStagiaire: 'Formation certifiante. Certificat médical requis.',
    nombreParticipants: 15,
    placesRestantes: 0, // Complet
    hebergement: 'Auberge de jeunesse',
    tarif: 180,
    discipline: 'Formation',
    organisateur: 'Club Alpin Français - Section Grenoble',
    responsable: 'Dr. Sophie Rousseau',
    emailContact: 'sophie.rousseau@ffcam.fr',
    documents: [
      {
        type: 'prerequis',
        nom: 'Prérequis médicaux',
        url: 'https://example.com/prereq.pdf'
      },
      {
        type: 'programme',
        nom: 'Programme de formation',
        url: 'https://example.com/formation.pdf'
      }
    ],
    firstSeenAt: '2025-07-03T08:20:00.000Z',
    lastSeenAt: '2025-07-03T08:20:00.000Z'
  }
];

// Scénarios de test avec différentes conditions
const testScenarios = [
  {
    name: 'Formations normales',
    formations: mockFormations.slice(0, 2),
    description: 'Test avec des formations ayant des dates normales'
  },
  {
    name: 'Formation sans dates',
    formations: [mockFormations[2]], // Celle sans dates
    description: 'Test avec une formation sans dates (cas problématique)'
  },
  {
    name: 'Toutes les formations',
    formations: mockFormations,
    description: 'Test avec toutes les formations mockées'
  },
  {
    name: 'Formation avec dates invalides',
    formations: [{
      ...mockFormations[0],
      dates: ['', 'invalid-date', '2025-08-15T00:00:00.000Z'] // Mix de dates valides/invalides
    }],
    description: 'Test avec des dates invalides'
  }
];

function generateTestEmails() {
  const renderer = new EmailTemplateRenderer();
  
  console.log('🧪 Génération des emails de test...\n');
  
  testScenarios.forEach((scenario, index) => {
    try {
      console.log(`📧 Test ${index + 1}: ${scenario.name}`);
      console.log(`   ${scenario.description}`);
      
      const htmlContent = renderer.render(scenario.formations);
      const subject = renderer.getSubject(scenario.formations);
      
      // Écrire le fichier HTML
      const filename = `test-email-${index + 1}-${scenario.name.toLowerCase().replace(/\s+/g, '-')}.html`;
      const filepath = join(process.cwd(), 'temp', filename);
      
      // Créer le dossier temp s'il n'existe pas
      const fs = require('fs');
      const tempDir = join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      writeFileSync(filepath, htmlContent);
      
      console.log(`   ✅ Généré: ${filename}`);
      console.log(`   📬 Sujet: ${subject}`);
      console.log(`   🎯 Formations: ${scenario.formations.length}`);
      
      // Afficher les dates pour debug
      scenario.formations.forEach((formation, fIndex) => {
        console.log(`   📅 ${formation.titre}: ${formation.dates.join(', ')}`);
      });
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      console.log(`   🔍 Stack: ${error.stack}`);
      console.log('');
    }
  });
  
  console.log('✨ Tests terminés! Vérifiez les fichiers dans le dossier temp/');
}

// Fonction pour analyser les dates
function analyzeDates() {
  console.log('🔍 Analyse des dates dans les formations mockées:\n');
  
  mockFormations.forEach((formation, index) => {
    console.log(`${index + 1}. ${formation.titre}`);
    console.log(`   Dates brutes: [${formation.dates.join(', ')}]`);
    console.log(`   Nombre de dates: ${formation.dates.length}`);
    
    formation.dates.forEach((date, dIndex) => {
      try {
        const parsedDate = new Date(date);
        const isValid = !isNaN(parsedDate.getTime());
        console.log(`   Date ${dIndex + 1}: "${date}" -> ${isValid ? parsedDate.toLocaleDateString('fr-FR') : 'INVALIDE'}`);
      } catch (error) {
        console.log(`   Date ${dIndex + 1}: "${date}" -> ERREUR: ${error.message}`);
      }
    });
    console.log('');
  });
}

// Fonction pour tester le formatage des dates
function testDateFormatting() {
  console.log('🧪 Test du formatage des dates:\n');
  
  const renderer = new EmailTemplateRenderer();
  const testDates = [
    '2025-08-15T00:00:00.000Z',
    '2025-12-25T00:00:00.000Z',
    '',
    'invalid-date',
    undefined,
    null
  ];
  
  testDates.forEach((date, index) => {
    try {
      // Simuler le formatage comme dans le template
      const result = date ? renderer['formatDate'](date) : 'VIDE';
      console.log(`${index + 1}. "${date}" -> "${result}"`);
    } catch (error) {
      console.log(`${index + 1}. "${date}" -> ERREUR: ${error.message}`);
    }
  });
  console.log('');
}

// Exécution des tests
if (require.main === module) {
  console.log('🚀 Test du template d\'email FFCAM\n');
  
  analyzeDates();
  testDateFormatting();
  generateTestEmails();
}