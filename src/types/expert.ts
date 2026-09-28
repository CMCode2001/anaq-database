import type { Database } from "@/types/database";
import type { CountBucket } from "@/types/common";

/** Ligne brute telle que stockée en base. */
export type ExpertRow = Database["public"]["Tables"]["experts"]["Row"];

/** Payload d'insertion accepté par la base. */
export type ExpertInsert = Database["public"]["Tables"]["experts"]["Insert"];

/**
 * Représentation métier d'un expert, utilisée dans toute l'application.
 * Découplée volontairement de la ligne SQL, comme pour les autres entités.
 */
export interface Expert {
  id: string;
  firstName: string;
  lastName: string;
  /** Nationalité telle que saisie à l'origine (audit / recherche). */
  nationalityRaw: string;
  /** Nationalité canonique, casse corrigée. */
  nationality: string;
  country: string;
  countryCode: string | null;
  region: string;
  institution: string | null;
  /** Profession telle que saisie à l'origine. */
  professionRaw: string;
  /** Catégorie canonique, utilisée pour les statistiques. */
  professionCategory: string;
  /** Domaine scientifique canonique (macro-discipline). */
  domain: string;
  /** Discipline / spécialité telle que saisie à l'origine. */
  specialtyRaw: string;
  cvUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ExpertSortField =
  | "created_at"
  | "last_name"
  | "first_name"
  | "nationality"
  | "institution"
  | "domain";

export type SortDirection = "asc" | "desc";

/** Critères de recherche / filtrage de la liste administrateur. */
export interface ExpertQuery {
  search?: string;
  institution?: string;
  domain?: string;
  region?: string;
  professionCategory?: string;
  sort: ExpertSortField;
  direction: SortDirection;
  page: number;
  pageSize: number;
}

export interface PaginatedExperts {
  items: Expert[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface ExpertStats {
  total: number;
  distinctNationalities: number;
  distinctInstitutions: number;
  distinctDomains: number;
  byDomain: CountBucket[];
  byRegion: CountBucket[];
  byProfessionCategory: CountBucket[];
  topNationalities: CountBucket[];
  topInstitutions: CountBucket[];
}

/** Mappe une ligne SQL vers le modèle métier. */
export function toExpert(row: ExpertRow): Expert {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    nationalityRaw: row.nationality_raw,
    nationality: row.nationality,
    country: row.country,
    countryCode: row.country_code,
    region: row.region,
    institution: row.institution,
    professionRaw: row.profession_raw,
    professionCategory: row.profession_category,
    domain: row.domain,
    specialtyRaw: row.specialty_raw,
    cvUrl: row.cv_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
