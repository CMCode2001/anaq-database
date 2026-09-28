"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ExpertRowActions } from "@/components/admin/expert-row-actions";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatFirstName, formatFullName, formatLastName, truncate } from "@/lib/utils";
import type { Expert } from "@/types/expert";

/**
 * Ligne du tableau des experts, cliquable dans son ensemble.
 *
 * Le prénom reste un vrai lien : c’est lui qui porte l’accessibilité —
 * navigation au clavier, annonce par les lecteurs d’écran, ouverture dans un
 * nouvel onglet. Le `onClick` posé sur la ligne n’est qu’une commodité pour
 * la souris.
 */
export function ExpertRow({ expert }: { expert: Expert }) {
  const router = useRouter();

  const href = `/admin/experts/${expert.id}`;
  const fullName = formatFullName(expert.firstName, expert.lastName);

  return (
    <TableRow
      onClick={() => router.push(href)}
      className="cursor-pointer"
      title={`Ouvrir la fiche de ${fullName}`}
    >
      <TableCell className="font-medium">
        <Link
          href={href}
          onClick={(event) => event.stopPropagation()}
          className="rounded hover:text-gold-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {formatFirstName(expert.firstName)}
        </Link>
      </TableCell>

      <TableCell className="font-semibold">
        {formatLastName(expert.lastName)}
      </TableCell>

      <TableCell>
        <span title={expert.nationalityRaw}>{expert.nationality}</span>
      </TableCell>

      <TableCell className="max-w-[16rem]" title={expert.institution ?? undefined}>
        {expert.institution ? (
          truncate(expert.institution, 34)
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      <TableCell className="max-w-[14rem]">
        <Badge
          variant={expert.domain === "Hors domaine" ? "destructive" : "outline"}
          title={expert.domain}
        >
          {truncate(expert.domain, 26)}
        </Badge>
      </TableCell>

      <TableCell className="max-w-[16rem]" title={expert.professionRaw}>
        {truncate(expert.professionRaw, 34)}
      </TableCell>

      <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
        <ExpertRowActions expertId={expert.id} expertName={fullName} cvUrl={expert.cvUrl} />
      </TableCell>
    </TableRow>
  );
}
