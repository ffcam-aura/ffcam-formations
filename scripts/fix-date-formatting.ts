#!/usr/bin/env npx tsx
/**
 * Script pour corriger et tester le formatage des dates dans les emails
 * Usage: npx tsx scripts/fix-date-formatting.ts
 */

import { EmailTemplateRenderer } from '@/services/notifications/emailTemplate.service';
import { Formation } from '@/types/formation';

// Classe corrigée pour le formatage des dates
class FixedEmailTemplateRenderer extends EmailTemplateRenderer {
  protected formatDate(dateString: string): string {
    // Gérer les cas d'erreur
    if (!dateString || dateString.trim() === '') {
      return 'Date non spécifiée';
    }
    
    try {
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      // Formater la date en français
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      console.error(`Erreur lors du formatage de la date "${dateString}":`, error);
      return 'Date invalide';
    }
  }
  
  // Surcharger la méthode pour gérer les dates vides
  protected renderFormationDetails(formation: Formation): string {
    // Filtrer les dates vides avant formatage
    const validDates = formation.dates.filter(date => date && date.trim() !== '');
    const formattedDates = validDates.length > 0 
      ? validDates.map(date => this.formatDate(date)).join(' au ')
      : 'Dates à définir';
    
    const details = [
        { icon: '📍', label: 'Lieu', value: formation.lieu },
        { icon: '📅', label: 'Dates', value: formattedDates },
        ...this.renderOptionalInformation(formation),
        { 
          icon: '👥', 
          label: 'Participants', 
          value: `${formation.nombreParticipants} maximum${
            formation.placesRestantes ? ` (${formation.placesRestantes} places restantes)` : ''
          }` 
        },
        formation.tarif ? { icon: '💰', label: 'Tarif', value: `${formation.tarif}€` } : null,
        { icon: '🏠', label: 'Hébergement', value: formation.hebergement },
        { icon: '👤', label: 'Organisateur', value: formation.organisateur },
        { icon: '👨‍🏫', label: 'Responsable', value: formation.responsable },
        formation.emailContact ? { icon: '✉️', label: 'Contact', value: formation.emailContact } : null
    ].filter((detail): detail is { icon: string; label: string; value: string } => Boolean(detail));

    return details.map(detail => this.renderDetailLine(detail)).join('') + 
           this.renderDocuments(formation.documents);
  }
}

// Données de test problématiques
const problematicFormations: Formation[] = [
  {
    reference: 'REF-PROBLEM-001',
    titre: 'Formation avec dates vides',
    dates: ['', '   ', '2025-08-15T00:00:00.000Z'], // Mix de dates vides et valides
    lieu: 'Test Location',
    informationStagiaire: 'Test info',
    nombreParticipants: 10,
    placesRestantes: 5,
    hebergement: 'Test Hébergement',
    tarif: 200,
    discipline: 'Test Discipline',
    organisateur: 'Test Organisateur',
    responsable: 'Test Responsable',
    emailContact: 'test@test.com',
    documents: [],
    firstSeenAt: '2025-07-03T10:30:00.000Z',
    lastSeenAt: '2025-07-03T10:30:00.000Z'
  },
  {
    reference: 'REF-PROBLEM-002',
    titre: 'Formation sans dates',
    dates: [], // Aucune date
    lieu: 'Test Location 2',
    informationStagiaire: 'Test info 2',
    nombreParticipants: 8,
    placesRestantes: 3,
    hebergement: 'Test Hébergement 2',
    tarif: 150,
    discipline: 'Test Discipline 2',
    organisateur: 'Test Organisateur 2',
    responsable: 'Test Responsable 2',
    emailContact: 'test2@test.com',
    documents: [],
    firstSeenAt: '2025-07-03T10:30:00.000Z',
    lastSeenAt: '2025-07-03T10:30:00.000Z'
  },
  {
    reference: 'REF-PROBLEM-003',
    titre: 'Formation avec dates invalides',
    dates: ['invalid-date', '2025-13-45T00:00:00.000Z', 'not-a-date'], // Dates invalides
    lieu: 'Test Location 3',
    informationStagiaire: 'Test info 3',
    nombreParticipants: 12,
    placesRestantes: 7,
    hebergement: 'Test Hébergement 3',
    tarif: 300,
    discipline: 'Test Discipline 3',
    organisateur: 'Test Organisateur 3',
    responsable: 'Test Responsable 3',
    emailContact: 'test3@test.com',
    documents: [],
    firstSeenAt: '2025-07-03T10:30:00.000Z',
    lastSeenAt: '2025-07-03T10:30:00.000Z'
  }
];

function testDateFormattingFix() {
  console.log('🧪 Test du formatage des dates - Version corrigée\n');
  
  const originalRenderer = new EmailTemplateRenderer();
  const fixedRenderer = new FixedEmailTemplateRenderer();
  
  console.log('📅 Test des dates individuelles:\n');
  
  const testDates = [
    '2025-08-15T00:00:00.000Z',
    '',
    '   ',
    'invalid-date',
    '2025-13-45T00:00:00.000Z',
    '2025-12-25T00:00:00.000Z'
  ];
  
  testDates.forEach((date, index) => {
    console.log(`${index + 1}. Date: "${date}"`);
    
    try {
      const originalResult = originalRenderer['formatDate'](date);
      console.log(`   ✅ Original: "${originalResult}"`);
    } catch (error) {
      console.log(`   ❌ Original: ERREUR - ${error.message}`);
    }
    
    try {
      const fixedResult = fixedRenderer['formatDate'](date);
      console.log(`   ✅ Corrigé: "${fixedResult}"`);
    } catch (error) {
      console.log(`   ❌ Corrigé: ERREUR - ${error.message}`);
    }
    
    console.log('');
  });
  
  console.log('📧 Test des emails avec formations problématiques:\n');
  
  problematicFormations.forEach((formation, index) => {
    console.log(`${index + 1}. Formation: ${formation.titre}`);
    console.log(`   Dates: [${formation.dates.join(', ')}]`);
    
    try {
      const originalHtml = originalRenderer.render([formation]);
      console.log(`   ✅ Original: Email généré (${originalHtml.length} caractères)`);
    } catch (error) {
      console.log(`   ❌ Original: ERREUR - ${error.message}`);
    }
    
    try {
      const fixedHtml = fixedRenderer.render([formation]);
      console.log(`   ✅ Corrigé: Email généré (${fixedHtml.length} caractères)`);
      
      // Sauvegarder pour inspection
      const fs = require('fs');
      const path = require('path');
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const filename = `fixed-email-${index + 1}.html`;
      fs.writeFileSync(path.join(tempDir, filename), fixedHtml);
      console.log(`   💾 Sauvegardé: temp/${filename}`);
      
    } catch (error) {
      console.log(`   ❌ Corrigé: ERREUR - ${error.message}`);
    }
    
    console.log('');
  });
}

// Fonction pour générer le code de correction
function generateFixCode() {
  console.log('🔧 Code de correction pour EmailTemplateRenderer:\n');
  
  const fixCode = `
// Dans services/notifications/emailTemplate.service.ts
// Remplacer la méthode formatDate par :

private formatDate(dateString: string): string {
  // Gérer les cas d'erreur
  if (!dateString || dateString.trim() === '') {
    return 'Date non spécifiée';
  }
  
  try {
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    // Formater la date en français
    return date.toLocaleDateString('fr-FR');
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return 'Date invalide';
  }
}

// Et modifier renderFormationDetails pour filtrer les dates vides :

private renderFormationDetails(formation: Formation): string {
  // Filtrer les dates vides avant formatage
  const validDates = formation.dates.filter(date => date && date.trim() !== '');
  const formattedDates = validDates.length > 0 
    ? validDates.map(date => this.formatDate(date)).join(' au ')
    : 'Dates à définir';
  
  const details = [
      { icon: '📍', label: 'Lieu', value: formation.lieu },
      { icon: '📅', label: 'Dates', value: formattedDates },
      // ... reste du code inchangé
  ];
  
  // ... reste de la méthode inchangé
}
`;
  
  console.log(fixCode);
}

// Exécution des tests
if (require.main === module) {
  console.log('🚀 Test et correction du formatage des dates\n');
  
  testDateFormattingFix();
  generateFixCode();
  
  console.log('✨ Tests terminés! Vérifiez les fichiers dans le dossier temp/');
}