"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reinitialiser-mot-de-passe`
        : `${(await import("@/lib/app-url")).getAppBaseUrl()}/reinitialiser-mot-de-passe`;

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-sm text-foreground font-medium">
          Si un compte existe pour cet email, un lien pour réinitialiser votre
          mot de passe vous a été envoyé. Vérifiez votre boîte de réception et
          les spams.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Email du compte
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-primary"
          placeholder="vous@exemple.org"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Envoi en cours..." : "Envoyer le lien"}
      </button>
    </form>
  );
}
