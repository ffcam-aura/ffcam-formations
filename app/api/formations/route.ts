import { NextResponse } from 'next/server';
import { FormationService } from '@/services/formation/formations.service';
import { FormationRepository } from '@/repositories/FormationRepository';
import { logger } from '@/lib/logger';
import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitResponse,
  addRateLimitHeaders,
} from '@/lib/rateLimit';

const formationRepository = new FormationRepository();
const formationService = new FormationService(formationRepository);

// Rate limit: 60 requests per minute per IP
const RATE_LIMIT_CONFIG = { limit: 60, windowSeconds: 60 };

export async function GET(request: Request) {
  // Apply rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(`formations:${clientId}`, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.success) {
    logger.warn('Rate limit exceeded', { clientId, endpoint: '/api/formations' });
    return rateLimitResponse(rateLimitResult);
  }

  try {
    const allFormations = await formationService.getAllFormations();
    const response = NextResponse.json(allFormations);
    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    logger.error('Erreur API /api/formations', error);

    const err = error as Error;

    // Gestion des erreurs spécifiques
    if (err?.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        { 
          error: 'SERVICE_UNAVAILABLE',
          message: 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.',
          details: 'Connexion à la base de données impossible'
        }, 
        { status: 503 }
      );
    }

    if (err?.name === 'PrismaClientKnownRequestError') {
      return NextResponse.json(
        { 
          error: 'DATABASE_ERROR',
          message: 'Erreur lors de la récupération des données. Veuillez réessayer.',
          details: 'Erreur de requête base de données'
        }, 
        { status: 500 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      { 
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Une erreur inattendue s&apos;est produite. Veuillez réessayer plus tard.',
        details: process.env.NODE_ENV === 'development' ? err?.message : undefined
      }, 
      { status: 500 }
    );
  }
}