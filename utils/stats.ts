import { Formation } from '@/types/formation';

export function generateStats(formations: Formation[]) {
  const disciplineDistribution = formations.reduce((acc, f) => {
    acc[f.discipline] = (acc[f.discipline] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formationsAvecTarif = formations.filter(f => f.tarif > 0);
  const tarifMoyen = formationsAvecTarif.length > 0 
    ? formationsAvecTarif.reduce((acc, f) => acc + f.tarif, 0) / formationsAvecTarif.length
    : 0;

  return {
    total: formations.length,
    uniqueDisciplines: new Set(formations.map(f => f.discipline)).size,
    uniqueLocations: new Set(formations.map(f => f.lieu)).size,
    averagePrice: tarifMoyen,
    pricedFormations: formationsAvecTarif.length,
    disciplines: disciplineDistribution,
    dateRange: calculateDateRange(formations)
  };
}

function calculateDateRange(formations: Formation[]) {
  const dates = formations
    .flatMap(f => f.dates)
    .map(d => new Date(d.split('/').reverse().join('-')));

  return {
    start: new Date(Math.min(...dates.map(d => d.getTime()))),
    end: new Date(Math.max(...dates.map(d => d.getTime())))
  };
}