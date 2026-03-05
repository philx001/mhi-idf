"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserPassword } from "../actions";

interface SetPasswordButtonProps {
  userId: string;
  email: string;
}

export function SetPasswordButton({ userId, email }: SetPasswordButtonProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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
    const result = await setUserPassword(userId, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setPassword("");
    setConfirm("");
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-sm text-amber-600 hover:underline font-medium"
      >
        Définir mot de passe
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 p-4 border border-amber-200 rounded-lg bg-amber-50/50 space-y-3"
        >
          <p className="text-xs text-amber-800">
            Définir un mot de passe temporaire pour <strong>{email}</strong>. Communiquez-le
            à l&apos;utilisateur de manière sécurisée. Utile si « Mot de passe oublié » ne fonctionne pas.
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Min. 6 caractères"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirmer</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && (
            <p className="text-xs text-green-600 font-medium">Mot de passe défini. L&apos;utilisateur peut se connecter.</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "..." : "Définir"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(null); setSuccess(false); }}
              className="px-3 py-1.5 text-gray-600 text-sm hover:underline"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
