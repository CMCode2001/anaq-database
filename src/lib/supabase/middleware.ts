import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Rafraîchit la session Supabase à chaque requête et protège /admin.
 *
 * Première barrière (UX + défense en profondeur) : la véritable autorisation
 * reste appliquée par RLS en base et par `requireAdmin()` côté serveur.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  let env;
  try {
    env = publicEnv();
  } catch {
    // Environnement non configuré : on laisse passer, les pages afficheront
    // un message d'erreur explicite plutôt qu'une boucle de redirection.
    return response;
  }

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // `getUser()` revalide le JWT auprès de Supabase : ne pas remplacer par
  // getSession(), qui se contente de lire le cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isLoginRoute = pathname.startsWith("/admin/login");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}
