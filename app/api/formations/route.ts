import { NextResponse } from 'next/server';
import { FormationsService } from '@/app/services/formations.service';

export async function GET() {
  const allFormations = await FormationsService.getAllFormations();
  return NextResponse.json(allFormations);
}