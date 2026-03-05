"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteUserByEmail, createUserWithPassword } from "../actions";

type ChurchOption = { id: string; name: string };

type Mode = "email" | "password";

interface InviteFormProps {
  /** Église par défaut (ex. église du responsable). Si fournie, le rôle membre est attribué automatiquement. */
  defaultChurchId?: string | null;
  /** Liste des églises pour le sélecteur (siège, Croissy). Vide = pas de choix. */
  churches?: ChurchOption[];
}

export function InviteForm({ defaultChurchId = null, churches = [] }: InviteFormProps) {
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [churchId, setChurchId] = useState<string>(defaultChurchId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const effectiveChurchId = churchId || defaultChurchId || null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!email.trim()) return;
    if (mode === "password") {
      if (password !== confirmPassword) {
        setError("Les deux mots de passe ne correspondent pas.");
        return;
      }
      if (password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
    }
    setLoading(true);
    const result =
      mode === "email"
        ? await inviteUserByEmail(email.trim(), effectiveChurchId)
        : await createUserWithPassword(email.trim(), password, effectiveChurchId);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm"
      >
        + Inviter un membre
      </button>
      {open && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3 max-w-md"
        >
          <div className="flex gap-4 border-b border-gray-200 pb-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="invite-mode"
                checked={mode === "email"}
                onChange={() => { setMode("email"); setError(null); }}
                className="rounded"
              />
              <span>Option A : Inviter par email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="invite-mode"
                checked={mode === "password"}
                onChange={() => { setMode("password"); setError(null); }}
                className="rounded"
              />
              <span>Option B : Créer avec mot de passe</span>
            </label>
          </div>

          {mode === "email" ? (
            <p className="text-sm text-gray-600">
              Un email d&apos;invitation sera envoyé (lien valable 24 h).{" "}
              {effectiveChurchId
                ? "Le membre sera automatiquement ajouté à l'église sélectionnée."
                : "Après inscription, attribuez un rôle dans la section « Utilisateurs sans rôle »."}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Le compte sera créé sans envoi d&apos;email. Communiquez le mot de passe à la personne en personne ou par un canal sécurisé.
            </p>
          )}

          {churches.length > 1 && (
            <div>
              <label htmlFor="invite-church" className="block text-xs font-medium text-gray-700 mb-1">
                Église
              </label>
              <select
                id="invite-church"
                value={churchId}
                onChange={(e) => setChurchId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">— Attribuer plus tard —</option>
                {churches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="invite-email" className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {mode === "password" && (
            <>
              <div>
                <label htmlFor="invite-password" className="block text-xs font-medium text-gray-700 mb-1">
                  Mot de passe temporaire
                </label>
                <input
                  id="invite-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  required={mode === "password"}
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label htmlFor="invite-confirm" className="block text-xs font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  id="invite-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répéter le mot de passe"
                  required={mode === "password"}
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && (
            <p className="text-xs text-green-600">
              {mode === "email" ? "Invitation envoyée." : "Compte créé. Communiquez le mot de passe à la personne."}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading
                ? "..."
                : mode === "email"
                  ? "Envoyer l'invitation"
                  : "Créer le compte"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
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
