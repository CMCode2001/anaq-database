import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ExpertRepositoryError,
  type ExpertInput,
  type ExpertRepository,
} from "@/lib/repositories/expert-repository";
import type { Database } from "@/types/database";
import {
  toExpert,
  type Expert,
  type ExpertQuery,
  type ExpertRow,
  type ExpertStats,
  type PaginatedExperts,
} from "@/types/expert";
import type { CountBucket } from "@/types/common";

type Client = SupabaseClient<Database>;

/** Colonnes sélectionnées : jamais `select('*')`, pour garder un contrat stable. */
const COLUMNS =
  "id, first_name, last_name, nationality_raw, nationality, country, country_code, " +
  "region, institution, profession_raw, profession_category, domain, specialty_raw, " +
  "cv_url, notes, created_at, updated_at";

/** Nombre de lignes analysées pour les agrégats du tableau de bord et les filtres. */
const STATS_SAMPLE = 10_000;

/**
 * Implémentation Supabase du contrat `ExpertRepository`.
 *
 * Toutes les requêtes s'exécutent avec l'identité de l'appelant : l'accès
 * réservé aux administrateurs est garanti par RLS, pas par ce code.
 */
export class SupabaseExpertRepository implements ExpertRepository {
  constructor(private readonly client: Client) {}

  async list(query: ExpertQuery): Promise<PaginatedExperts> {
    const page = Math.max(1, query.page);
    const pageSize = query.pageSize;
    const offset = (page - 1) * pageSize;

    const request = applyFilters(
      this.client.from("experts").select(COLUMNS, { count: "exact" }),
      query,
    )
      .order(query.sort, { ascending: query.direction === "asc" })
      .order("id", { ascending: true }) // tri stable en cas d'égalité
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await request;

    if (error) {
      throw new ExpertRepositoryError(
        "Impossible de charger la liste des experts.",
        error,
      );
    }

    const total = count ?? 0;

    return {
      items: (data as unknown as ExpertRow[] | null)?.map(toExpert) ?? [],
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async listAll(
    query: Omit<ExpertQuery, "page" | "pageSize">,
    max: number,
  ): Promise<Expert[]> {
    const { data, error } = await applyFilters(
      this.client.from("experts").select(COLUMNS),
      query,
    )
      .order(query.sort, { ascending: query.direction === "asc" })
      .order("id", { ascending: true })
      .limit(max);

    if (error) {
      throw new ExpertRepositoryError(
        "Impossible de préparer l'export des experts.",
        error,
      );
    }

    return (data as unknown as ExpertRow[] | null)?.map(toExpert) ?? [];
  }

  async findById(id: string): Promise<Expert | null> {
    const { data, error } = await this.client
      .from("experts")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new ExpertRepositoryError(
        "Impossible de charger la fiche de l'expert.",
        error,
      );
    }

    return data ? toExpert(data as unknown as ExpertRow) : null;
  }

  async create(input: ExpertInput): Promise<Expert> {
    const { data, error } = await this.client
      .from("experts")
      .insert(toRow(input))
      .select(COLUMNS)
      .single();

    if (error) {
      throw new ExpertRepositoryError(
        "Impossible de créer la fiche de l'expert.",
        error,
      );
    }

    return toExpert(data as unknown as ExpertRow);
  }

  async update(id: string, input: ExpertInput): Promise<Expert> {
    const { data, error } = await this.client
      .from("experts")
      .update(toRow(input))
      .eq("id", id)
      .select(COLUMNS)
      .single();

    if (error) {
      throw new ExpertRepositoryError(
        "Impossible de mettre à jour la fiche de l'expert.",
        error,
      );
    }

    return toExpert(data as unknown as ExpertRow);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from("experts").delete().eq("id", id);

    if (error) {
      throw new ExpertRepositoryError(
        "Impossible de supprimer la fiche de l'expert.",
        error,
      );
    }
  }

  async stats(): Promise<ExpertStats> {
    const total = await this.count();

    const { data, error } = await this.client
      .from("experts")
      .select("nationality, institution, domain, region, profession_category")
      .limit(STATS_SAMPLE);

    if (error) {
      throw new ExpertRepositoryError(
        "Impossible de calculer les statistiques.",
        error,
      );
    }

    const rows = data ?? [];

    return {
      total,
      distinctNationalities: distinctCount(rows.map((row) => row.nationality)),
      distinctInstitutions: distinctCount(rows.map((row) => row.institution)),
      distinctDomains: distinctCount(rows.map((row) => row.domain)),
      byDomain: topBuckets(rows.map((row) => row.domain), 10),
      byRegion: topBuckets(rows.map((row) => row.region), 10),
      byProfessionCategory: topBuckets(rows.map((row) => row.profession_category), 8),
      topNationalities: topBuckets(rows.map((row) => row.nationality), 8),
      topInstitutions: topBuckets(rows.map((row) => row.institution), 8),
    };
  }

  async facets(): Promise<{
    domains: string[];
    regions: string[];
    professionCategories: string[];
  }> {
    const { data, error } = await this.client
      .from("experts")
      .select("domain, region, profession_category")
      .limit(STATS_SAMPLE);

    if (error) {
      throw new ExpertRepositoryError(
        "Impossible de charger les filtres disponibles.",
        error,
      );
    }

    const domains = new Set<string>();
    const regions = new Set<string>();
    const professionCategories = new Set<string>();

    for (const row of data ?? []) {
      if (row.domain) domains.add(row.domain);
      if (row.region) regions.add(row.region);
      if (row.profession_category) professionCategories.add(row.profession_category);
    }

    const collator = new Intl.Collator("fr");
    return {
      domains: [...domains].sort(collator.compare),
      regions: [...regions].sort(collator.compare),
      professionCategories: [...professionCategories].sort(collator.compare),
    };
  }

  private async count(): Promise<number> {
    const { count, error } = await this.client
      .from("experts")
      .select("id", { count: "exact", head: true });

    if (error) {
      throw new ExpertRepositoryError("Impossible de compter les experts.", error);
    }
    return count ?? 0;
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function toRow(input: ExpertInput) {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    nationality_raw: input.nationalityRaw,
    nationality: input.nationality,
    country: input.country,
    country_code: input.countryCode,
    region: input.region,
    institution: input.institution,
    profession_raw: input.professionRaw,
    profession_category: input.professionCategory,
    domain: input.domain,
    specialty_raw: input.specialtyRaw,
    cv_url: input.cvUrl,
    notes: input.notes,
  };
}

/**
 * Sous-ensemble structurel de PostgrestFilterBuilder réellement utilisé ici.
 * Déclaré localement pour ne pas dépendre des génériques internes de
 * postgrest-js, qui changent d'une version à l'autre.
 */
interface FilterableQuery<Self> {
  or(filters: string): Self;
  eq(column: string, value: string): Self;
}

/** Applique les filtres de recherche communs à la liste et aux exports. */
function applyFilters<T extends FilterableQuery<T>>(
  builder: T,
  query: Omit<ExpertQuery, "page" | "pageSize">,
): T {
  let request = builder;

  if (query.search) {
    const term = sanitizePattern(query.search);
    if (term) {
      request = request.or(
        [
          `first_name.ilike.%${term}%`,
          `last_name.ilike.%${term}%`,
          `institution.ilike.%${term}%`,
          `nationality.ilike.%${term}%`,
          `specialty_raw.ilike.%${term}%`,
        ].join(","),
      );
    }
  }

  if (query.domain) request = request.eq("domain", query.domain);
  if (query.region) request = request.eq("region", query.region);
  if (query.professionCategory) {
    request = request.eq("profession_category", query.professionCategory);
  }

  return request;
}

/**
 * Neutralise les caractères qui ont une signification dans la grammaire de
 * filtres PostgREST (`,` `(` `)`) ou dans les motifs LIKE (`%` `_` `\`).
 */
function sanitizePattern(value: string) {
  return value
    .replace(/[\\%_,()*]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function distinctCount(values: Array<string | null>): number {
  return new Set(values.filter((value): value is string => Boolean(value?.trim()))).size;
}

function topBuckets(values: Array<string | null>, limit: number): CountBucket[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const label = raw?.trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fr"))
    .slice(0, limit);
}
