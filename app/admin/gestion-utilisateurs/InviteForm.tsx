"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inviteUserByEmail } from "../actions";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!email.trim()) return;
    setLoading(true);
    const result = await inviteUserByEmail(email.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setEmail("");
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
          <p className="text-sm text-gray-600">
            Un email d&apos;invitation sera envoyé. Après inscription, attribuez un rôle à
            l&apos;utilisateur dans la section &laquo;&nbsp;Utilisateurs sans rôle&nbsp;&raquo;.
          </p>
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
          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && (
            <p className="text-xs text-green-600">Invitation envoyée.</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Envoyer l'invitation"}
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
