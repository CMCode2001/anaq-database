"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, UserRoundPlus, Users } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import type { AdminIdentity } from "@/lib/auth/guards";
import { cn } from "@/lib/utils";

const BASE_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/experts", label: "Experts", icon: Users },
  { href: "/admin/experts/new", label: "Ajouter un expert", icon: UserRoundPlus },
] as const;

const SUPER_ADMIN_NAV_ITEMS = [
  { href: "/admin/team", label: "Administrateurs", icon: ShieldCheck },
] as const;

const NO_PREFIX_MATCH = new Set<string>(["/admin/experts/new", "/admin/team"]);

/** Liste de navigation visible pour un rôle donné -la gestion des comptes
 *  n'apparaît que pour les super-administrateurs. */
export function getNavItems(role: AdminIdentity["role"]) {
  return role === "super_admin"
    ? [...BASE_NAV_ITEMS, ...SUPER_ADMIN_NAV_ITEMS]
    : BASE_NAV_ITEMS;
}

/**
 * Barre latérale de l’espace d’administration.
 *
 * Fond bleu de nuit `#0a1524`, nettement plus sombre que le fond de page :
 * la barre se lit comme un bloc d’identité, pas comme une surface de contenu.
 *
 * Le même composant sert au rail fixe du bureau et au tiroir mobile ;
 * `onNavigate` permet à ce dernier de se refermer après un clic.
 */
export function AdminSidebar({
  role,
  onNavigate,
}: {
  role: AdminIdentity["role"];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = getNavItems(role);

  return (
    <div className="flex h-full flex-col gap-7 bg-sidebar text-sidebar-foreground">
      <Link
        href="/admin/dashboard"
        onClick={onNavigate}
        className="flex justify-center rounded-xl py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]"
      >
        <BrandMark height={34} />
      </Link>

      <nav aria-label="Navigation principale" className="flex flex-col gap-1.5">
        <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Navigation
        </p>

        {items.map((item) => {
          const active =
            pathname === item.href ||
            (!NO_PREFIX_MATCH.has(item.href) && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
                active
                  ? "border-l-[3px] border-primary bg-sidebar-active pl-[13px] text-primary"
                  : "border-l-[3px] border-transparent pl-[13px] text-sidebar-foreground hover:bg-sidebar-hover",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
