import { z } from "zod";

import { PAGE_SIZE_DEFAULT } from "@/lib/constants";
import type { ExpertQuery } from "@/types/expert";

/**
 * Validation des paramètres d'URL de la liste administrateur.
 * Sert aussi bien aux Server Components qu'à la route d'export : toute
 * valeur non reconnue est ramenée à un défaut sûr (liste blanche), ce qui
 * empêche toute injection dans les clauses `order` / `ilike`.
 */

export const expertSortFields = [
  "created_at",
  "last_name",
  "first_name",
  "nationality",
  "institution",
  "domain",
] as const;

const optionalText = z
  .string()
  .trim()
  .max(200)
  .optional()
  .catch(undefined)
  .transform((value) => (value ? value : undefined));

export const expertQuerySchema = z.object({
  search: optionalText,
  institution: optionalText,
  domain: optionalText,
  region: optionalText,
  professionCategory: optionalText,
  sort: z.enum(expertSortFields).catch("created_at"),
  direction: z.enum(["asc", "desc"]).catch("desc"),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(PAGE_SIZE_DEFAULT),
});

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** Normalise `searchParams` (Next.js) en critères de requête typés. */
export function parseExpertQuery(params: RawSearchParams): ExpertQuery {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }

  return expertQuerySchema.parse({
    search: flat.search ?? undefined,
    institution: flat.institution ?? undefined,
    domain: flat.domain ?? undefined,
    region: flat.region ?? undefined,
    professionCategory: flat.professionCategory ?? undefined,
    sort: flat.sort ?? "created_at",
    direction: flat.direction ?? "desc",
    page: flat.page ?? 1,
    pageSize: flat.pageSize ?? PAGE_SIZE_DEFAULT,
  });
}

/** Reconstruit une query string canonique (liens de tri / pagination). */
export function buildExpertSearchParams(query: Partial<ExpertQuery>): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.institution) params.set("institution", query.institution);
  if (query.domain) params.set("domain", query.domain);
  if (query.region) params.set("region", query.region);
  if (query.professionCategory) {
    params.set("professionCategory", query.professionCategory);
  }
  if (query.sort && query.sort !== "created_at") params.set("sort", query.sort);
  if (query.direction && query.direction !== "desc") {
    params.set("direction", query.direction);
  }
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.pageSize && query.pageSize !== PAGE_SIZE_DEFAULT) {
    params.set("pageSize", String(query.pageSize));
  }
  return params;
}
