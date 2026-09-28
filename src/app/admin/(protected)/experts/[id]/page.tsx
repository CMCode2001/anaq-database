import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExpertDetailView } from "@/components/admin/expert-detail-view";
import { formatFullName } from "@/lib/utils";
import { getExpert } from "@/lib/services/experts";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const expert = await getExpert(id);
  return { title: expert ? formatFullName(expert.firstName, expert.lastName) : "Expert" };
}

export default async function ExpertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expert = await getExpert(id);

  if (!expert) notFound();

  return <ExpertDetailView expert={expert} />;
}
