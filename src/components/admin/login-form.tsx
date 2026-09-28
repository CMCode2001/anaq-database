"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, LogIn } from "lucide-react";

import { signInAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden="true" />
          Connexion…
        </>
      ) : (
        <>
          <LogIn aria-hidden="true" />
          Se connecter
        </>
      )}
    </Button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    signInAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

      <FormField id="email" label="Adresse email" required>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="votre email"
          required
        />
      </FormField>

      <FormField id="password" label="Mot de passe" required>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </FormField>

      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
