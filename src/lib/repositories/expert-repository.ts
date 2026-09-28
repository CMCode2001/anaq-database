import type {
  Expert,
  ExpertQuery,
  ExpertStats,
  PaginatedExperts,
} from "@/types/expert";

/** Données nécessaires à la création ou la modification d'une fiche expert. */
export interface ExpertInput {
  firstName: string;
  lastName: string;
  nationalityRaw: string;
  nationality: string;
  country: string;
  countryCode: string | null;
  region: string;
  institution: string | null;
  professionRaw: string;
  professionCategory: string;
  domain: string;
  specialtyRaw: string;
  cvUrl: string | null;
  notes: string | null;
}

/**
 * Contrat d'accès aux données experts.
 *
 * Point d'extension principal de l'architecture : l'implémentation Supabase
 * peut être remplacée par un client d'API backend classique sans toucher
 * aux pages, aux composants ni aux exports.
 */
export interface ExpertRepository {
  /** Liste paginée, filtrée et triée. */
  list(query: ExpertQuery): Promise<PaginatedExperts>;

  /** Toutes les lignes correspondant aux filtres, pour l'export. */
  listAll(query: Omit<ExpertQuery, "page" | "pageSize">, max: number): Promise<Expert[]>;

  /** Fiche détaillée, ou `null` si l'identifiant n'existe pas. */
  findById(id: string): Promise<Expert | null>;

  /** Création d'une nouvelle fiche expert. */
  create(input: ExpertInput): Promise<Expert>;

  /** Mise à jour d'une fiche existante. */
  update(id: string, input: ExpertInput): Promise<Expert>;

  /** Suppression définitive d'une fiche. */
  remove(id: string): Promise<void>;

  /** Indicateurs du tableau de bord. */
  stats(): Promise<ExpertStats>;

  /** Valeurs distinctes utilisées pour alimenter les filtres. */
  facets(): Promise<{ domains: string[]; regions: string[]; professionCategories: string[] }>;
}

/** Erreur métier normalisée, remontée telle quelle aux couches supérieures. */
export class ExpertRepositoryError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ExpertRepositoryError";
  }
}
