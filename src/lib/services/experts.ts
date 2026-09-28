import "server-only";

import { EXPORT_MAX_ROWS } from "@/lib/constants";
import { getExpertRepository } from "@/lib/repositories";
import type { ExpertInput } from "@/lib/repositories/expert-repository";
import type {
  Expert,
  ExpertQuery,
  ExpertStats,
  PaginatedExperts,
} from "@/types/expert";

/**
 * Logique métier « experts ».
 *
 * Les pages et les routes API ne parlent qu'à ce module : elles ignorent
 * totalement que les données viennent de Supabase.
 */

export async function listExperts(query: ExpertQuery): Promise<PaginatedExperts> {
  const repository = await getExpertRepository();
  return repository.list(query);
}

export async function listExpertsForExport(query: ExpertQuery): Promise<Expert[]> {
  const repository = await getExpertRepository();

  // La pagination ne s'applique pas à un export : seuls les filtres comptent.
  return repository.listAll(
    {
      search: query.search,
      institution: query.institution,
      domain: query.domain,
      region: query.region,
      professionCategory: query.professionCategory,
      sort: query.sort,
      direction: query.direction,
    },
    EXPORT_MAX_ROWS,
  );
}

export async function getExpert(id: string): Promise<Expert | null> {
  const repository = await getExpertRepository();
  return repository.findById(id);
}

export async function createExpert(input: ExpertInput): Promise<Expert> {
  const repository = await getExpertRepository();
  return repository.create(input);
}

export async function updateExpert(id: string, input: ExpertInput): Promise<Expert> {
  const repository = await getExpertRepository();
  return repository.update(id, input);
}

export async function deleteExpert(id: string): Promise<void> {
  const repository = await getExpertRepository();
  await repository.remove(id);
}

export async function getExpertStats(): Promise<ExpertStats> {
  const repository = await getExpertRepository();
  return repository.stats();
}

export async function getExpertFacets() {
  const repository = await getExpertRepository();
  return repository.facets();
}
