"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let subscription: { unsubscribe: () => void } | null = null;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
        return;
      }
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (!hash) {
        setError("Lien invalide ou expiré. Demandez un nouveau lien depuis « Mot de passe oublié ».");
        return;
      }
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, s) => {
        if (s) setReady(true);
      });
      subscription = sub;
      supabase.auth.getSession().then(({ data: { session: s2 } }) => {
        if (s2) setReady(true);
      });
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (!ready && !error) {
    return (
      <p className="text-muted-foreground text-sm">Vérification du lien...</p>
    );
  }

  if (error && !ready) {
    return (
      <div className="w-full max-w-sm space-y-4">
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
          {error}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-1">
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-primary"
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
        {loading ? "Enregistrement..." : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
