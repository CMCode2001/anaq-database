"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { AdminSidebar, NAV_ITEMS } from "@/components/admin/admin-sidebar";
import { AccountMenu } from "@/components/admin/account-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AdminIdentity } from "@/lib/auth/guards";

/**
 * Coquille de l’espace d’administration.
 *
 * Bureau : rail latéral marine fixe à gauche, contenu à droite.
 * Mobile : le même rail en tiroir coulissant, ouvert depuis la barre du haut.
 */
export function AdminShell({
  identity,
  children,
}: {
  identity: AdminIdentity;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Le tiroir se referme dès que la route change.
  React.useEffect(() => setDrawerOpen(false), [pathname]);

  const current = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-[17.5rem] shrink-0 bg-sidebar px-4 py-6 lg:block no-print">
        <AdminSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur no-print sm:px-6">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] lg:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
                <span className="sr-only">Ouvrir le menu de navigation</span>
              </button>
            </SheetTrigger>

            <SheetContent>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Accès au tableau de bord, aux experts et au compte.
              </SheetDescription>
              <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
            </SheetContent>
          </Sheet>

          <span className="truncate text-sm font-semibold text-foreground">
            {current?.label}
          </span>

          <div className="ml-auto">
            <AccountMenu identity={identity} />
          </div>
        </header>

        <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
