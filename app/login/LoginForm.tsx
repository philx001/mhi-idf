"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function parseHashParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const hash = window.location.hash.slice(1);
  return Object.fromEntries(new URLSearchParams(hash));
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = parseHashParams();
    if (params.error_code === "otp_expired" || params.error === "access_denied") {
      setError(
        "Ce lien d'invitation a expiré ou a déjà été utilisé. Demandez une nouvelle invitation à votre responsable, ou utilisez « Mot de passe oublié » si vous avez déjà un compte."
      );
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user) router.replace("/dashboard");
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    try {
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 8000)
      );

      const { error: authError } = await Promise.race([
        signInPromise,
        timeoutPromise,
      ]);

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Email ou mot de passe incorrect."
            : authError.message
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error && err.message === "timeout"
          ? "Connexion expirée. Vérifiez que le projet Supabase est actif (Dashboard > projet > Restore si nécessaire)."
          : err instanceof Error
          ? err.message
          : "Erreur de connexion.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-primary placeholder:text-muted-foreground"
          placeholder="vous@exemple.org"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-primary placeholder:text-muted-foreground"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/30">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      <p className="text-center">
        <Link href="/mot-de-passe-oublie" className="text-primary hover:underline text-sm">
          Mot de passe oublié ?
        </Link>
      </p>
      <p className="text-center">
        <Link href="/" className="text-primary hover:underline text-sm">
          ← Retour à l&apos;accueil
        </Link>
      </p>
    </form>
  );
}
