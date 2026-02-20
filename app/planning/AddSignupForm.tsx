"use client";

import { useState } from "react";

type Props = {
  sessionId: string;
  slotTime: string;
  churchMembers: { id: string; email: string }[];
  onSubmit: (input: {
    prayer_session_id: string;
    slot_time: string;
    user_id: string;
  }) => Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
};

export function AddSignupForm({
  sessionId,
  slotTime,
  churchMembers,
  onSubmit,
  onCancel,
  disabled,
}: Props) {
  const [user_id, setUser_id] = useState(churchMembers[0]?.id ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) return;
    const timeNormalized = slotTime.length === 5 ? slotTime : slotTime + ":00";
    await onSubmit({
      prayer_session_id: sessionId,
      slot_time: timeNormalized,
      user_id,
    });
  };

  if (churchMembers.length === 0) {
    return (
      <span className="text-gray-500 text-sm">
        Aucun membre disponible pour votre église. Attribuez des rôles dans la Gestion des
        utilisateurs ou au profil de l&apos;église.
      </span>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="inline-flex flex-wrap items-center gap-2">
      <select
        value={user_id}
        onChange={(e) => setUser_id(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
        required
      >
        <option value="">Choisir un membre</option>
        {churchMembers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.email}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={disabled}
        className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        Valider
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
      >
        Annuler
      </button>
    </form>
  );
}
