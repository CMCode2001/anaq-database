import { NextResponse, type NextRequest } from "next/server";

import { getAdminIdentity } from "@/lib/auth/guards";
import { buildExpertsWorkbook } from "@/lib/exports/excel";
import { contentDisposition, expertsExportFilename } from "@/lib/exports/filename";
import { listExpertsForExport } from "@/lib/services/experts";
import { parseExpertQuery } from "@/lib/validation/filters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/exports/excel -export Excel des experts.
 *
 * Les filtres actifs de la liste (recherche, domaine, région, profession)
 * sont transmis dans la query string et appliqués à l'export.
 * Réservé aux administrateurs : vérification d'identité + RLS.
 */
export async function GET(request: NextRequest) {
  const identity = await getAdminIdentity();
  if (!identity) {
    return NextResponse.json({ message: "Accès refusé." }, { status: 403 });
  }

  const query = parseExpertQuery(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  try {
    const experts = await listExpertsForExport(query);
    const workbook = buildExpertsWorkbook(experts, query);

    return new NextResponse(new Uint8Array(workbook), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": contentDisposition(expertsExportFilename("xlsx")),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[exports/excel] échec de génération", error);
    return NextResponse.json(
      { message: "La génération du fichier Excel a échoué." },
      { status: 500 },
    );
  }
}
