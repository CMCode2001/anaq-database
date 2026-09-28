"use client";

import { ChevronDown, LogOut } from "lucide-react";

import { signOutAction } from "@/app/admin/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminIdentity } from "@/lib/auth/guards";
import { cn } from "@/lib/utils";

/**
 * Identité de l’agent connecté, en haut à droite de la barre supérieure.
 *
 * Le nom et le rôle sont visibles en permanence — savoir sous quel compte on
 * travaille ne doit jamais demander un clic. Le menu déroulant porte
 * l’adresse complète et la déconnexion.
 */
export function AccountMenu({ identity }: { identity: AdminIdentity }) {
  const displayName = identity.fullName?.trim() || identity.email;
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel =
    identity.role === "super_admin" ? "Super administrateur" : "Administrateur";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex max-w-[15rem] items-center gap-2.5 rounded-full border border-border bg-secondary py-1.5 pl-1.5 pr-3 text-left transition-colors",
            "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]",
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
          >
            {initials}
          </span>

          <span className="hidden min-w-0 flex-1 sm:block">
            <span className="block truncate text-sm font-semibold leading-tight text-foreground">
              {displayName}
            </span>
            <span className="block truncate text-[11px] uppercase tracking-wide text-muted-foreground">
              {roleLabel}
            </span>
          </span>

          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Ouvrir le menu du compte</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[16rem]">
        <DropdownMenuLabel>
          <span className="block truncate font-normal normal-case tracking-normal text-foreground">
            {identity.email}
          </span>
          <span className="mt-0.5 block text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
            {roleLabel}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/*
          La déconnexion reste dans un <form> : Server Action en POST, jamais
          un lien GET qu’un préchargement pourrait déclencher tout seul.
        */}
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button
              type="submit"
              className="w-full text-destructive focus:text-destructive"
            >
              <LogOut aria-hidden="true" />
              Se déconnecter
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
