import { NextResponse } from 'next/server';
import { FFCAMScraper } from '@/app/lib/scraper';
import { FormationsService } from '@/app/services/formations.service';
import util from 'util';


export async function GET() {
  const lastSyncDate = await FormationsService.getLastSync();
  return NextResponse.json(lastSyncDate);
}

export async function POST() {
  try {
    console.log('\n🔍 Démarrage du scraping des formations FFCAM...\n');
    const startTime = new Date();
    
    const formations = await FFCAMScraper.scrapeFormations();
    
    // Affichage détaillé des formations
    console.log('📋 FORMATIONS TROUVÉES :\n');
    formations.forEach((f, index) => {
      console.log(`\n=== Formation ${index + 1}/${formations.length} ===`);
      console.log(util.inspect({
        reference: f.reference,
        titre: f.titre,
        dates: f.dates,
        lieu: f.lieu,
        informationStagiaire: f.informationStagiaire,
        discipline: f.discipline,
        organisateur: f.organisateur,
        responsable: f.responsable,
        nombreParticipants: f.nombreParticipants,
        placesRestantes: f.placesRestantes !== null ? f.placesRestantes : 'Non spécifié',
        hebergement: f.hebergement,
        tarif: f.tarif > 0 ? `${f.tarif}€` : 'Non spécifié',
        emailContact: f.emailContact || 'Non spécifié'
      }, {
        depth: null,
        colors: true,
        maxArrayLength: null,
        compact: false
      }));
      console.log('─'.repeat(50));
    });

    console.log(`\n📊 STATISTIQUES :`);
    console.log(`• Nombre total de formations : ${formations.length}`);
    console.log(`• Disciplines uniques : ${new Set(formations.map(f => f.discipline)).size}`);
    console.log(`• Lieux uniques : ${new Set(formations.map(f => f.lieu)).size}`);
    
    const formationsAvecPlaces = formations.filter(f => f.placesRestantes !== null);
    const placesTotales = formationsAvecPlaces.reduce((acc, f) => acc + (f.placesRestantes || 0), 0);
    console.log(`• Places restantes totales : ${placesTotales} sur ${formationsAvecPlaces.length} formations`);

    // Mise à jour du calcul du tarif moyen
    const formationsAvecTarif = formations.filter(f => f.tarif > 0);
    const tarifMoyen = formationsAvecTarif.length > 0 
      ? formationsAvecTarif.reduce((acc, f) => acc + f.tarif, 0) / formationsAvecTarif.length
      : 0;
    console.log(`• Tarif moyen : ${tarifMoyen > 0 ? `${tarifMoyen.toFixed(2)}€` : 'Non calculable'}`);
    console.log(`• Formations avec tarif : ${formationsAvecTarif.length}/${formations.length}`);

    // Distribution des disciplines
    console.log('\n📊 DISTRIBUTION PAR DISCIPLINE :');
    const disciplineStats = formations.reduce((acc, f) => {
      acc[f.discipline] = (acc[f.discipline] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(disciplineStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([discipline, count]) => {
        console.log(`• ${discipline}: ${count} formations`);
      });



    // Période couverte
    const dates = formations.flatMap(f => f.dates).map(d => new Date(d.split('/').reverse().join('-')));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    console.log(`\n📅 PÉRIODE COUVERTE : du ${minDate.toLocaleDateString('fr-FR')} au ${maxDate.toLocaleDateString('fr-FR')}`);

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(`\n⏱️ Durée du scraping : ${duration.toFixed(2)} secondes\n`);

    console.log('\n💾 SYNCHRONISATION AVEC LA BASE DE DONNÉES:');
    let succeeded = 0;
    const errors: {reference: string; error: string}[] = [];
    
    for (const formation of formations) {
      try {
        await FormationsService.upsertFormation(formation);
        succeeded++;
        process.stdout.write(`\r• Progression : ${succeeded}/${formations.length} formations synchronisées`);
      } catch (error) {
        console.error(`\n❌ Échec pour ${formation.reference}:`, error);
        errors.push({
          reference: formation.reference,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    console.log('\n');
    if (errors.length > 0) {
      console.log('\n⚠️ ERREURS DE SYNCHRONISATION :');
      errors.forEach(error => {
        console.log(`• ${error.reference}: ${error.error}`);
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: formations.length,
        duration: `${duration.toFixed(2)}s`,
        dateRange: {
          from: minDate.toISOString(),
          to: maxDate.toISOString()
        },
        disciplines: disciplineStats,
        tarifMoyen: tarifMoyen > 0 ? `${tarifMoyen.toFixed(2)}€` : 'Non calculable',
        formationsAvecTarif: `${formationsAvecTarif.length}/${formations.length}`
      }
    });
  } catch (error) {
    console.error('Error in sync process:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync formations',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}