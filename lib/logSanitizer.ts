import crypto from 'crypto';

/**
 * Expurge les contextes de logs avant envoi à Sentry.
 *
 * La politique de confidentialité annonce des données anonymisées : ni IP,
 * ni jeton ne doit sortir d'ici. Le filtrage vit au point de passage commun
 * plutôt qu'aux appelants, pour couvrir aussi ceux à venir.
 */

// Sel tiré au démarrage : les identifiants restent comparables entre eux au
// sein d'une instance, sans qu'un hash puisse être ramené à une IP par force
// brute — l'espace IPv4 est trop petit pour un hash non salé.
const SALT = crypto.randomBytes(16).toString('hex');

const SENSITIVE_KEYS = /^(clientid|ip|ipaddress|email|user|userid|token|secret|authorization|password)$/i;
const URL_KEYS = /url$/i;

export function pseudonymize(value: string): string {
  return `anon_${crypto.createHash('sha256').update(SALT + value).digest('hex').slice(0, 12)}`;
}

/** Conserve l'origine, seule partie utile au diagnostic, et retire le chemin
 *  et la requête où se logent les jetons (une URL de ping healthchecks.io est
 *  un secret en entier). */
export function redactUrl(value: string): string {
  try {
    const url = new URL(value);
    const hasSecret = (url.pathname && url.pathname !== '/') || url.search;
    return hasSecret ? `${url.origin}/[expurgé]` : url.origin;
  } catch {
    return '[url invalide]';
  }
}

export function sanitizeLogContext<T extends Record<string, unknown> | undefined>(
  context: T
): T {
  if (!context) return context;

  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string' && URL_KEYS.test(key)) {
      clean[key] = redactUrl(value);
    } else if (SENSITIVE_KEYS.test(key)) {
      clean[key] = typeof value === 'string' ? pseudonymize(value) : '[expurgé]';
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
}
