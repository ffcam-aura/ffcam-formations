import { NextResponse } from 'next/server';
import { FormationService } from '@/services/formation/formations.service';
import { FormationRepository } from '@/repositories/FormationRepository';

const formationRepository = new FormationRepository();
const formationService = new FormationService(formationRepository);

export async function GET() {
  const allFormations = await formationService.getAllFormations();
  return NextResponse.json(allFormations);
}