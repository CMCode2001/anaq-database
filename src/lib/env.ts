import { z } from "zod";

/**
 * Accès centralisé et validé aux variables d'environnement.
 *
 * Règle de sécurité : `SUPABASE_SERVICE_ROLE_KEY` n'est lue que via
 * `serverEnv()`, jamais exportée au niveau du module, et jamais importée
 * depuis un composant client (aucun préfixe NEXT_PUBLIC_).
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL doit être une URL valide."),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20, "NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante ou invalide."),
});

export function publicEnv() {
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      "Configuration Supabase incomplète. Renseignez NEXT_PUBLIC_SUPABASE_URL " +
        "et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local (voir .env.example).",
    );
  }

  return parsed.data;
}

/**
 * Indique si la connexion Supabase est configurée, sans lever d'exception.
 * Permet d'afficher un écran d'installation clair plutôt qu'une erreur 500
 * lors du tout premier démarrage du projet.
 */
export function isSupabaseConfigured() {
  return publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }).success;
}

/** Clé service_role -serveur uniquement. */
export function serviceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key.length < 20) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY est absente. Cette clé est requise " +
        "uniquement pour les tâches d'administration côté serveur.",
    );
  }
  return key;
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000"
  );
}
