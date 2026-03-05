"use client";

import { useState } from "react";
import type { NotificationImportance } from "@/types/database";

const IMPORTANCE_OPTIONS: { value: NotificationImportance; label: string }[] = [
  { value: "info", label: "Info (faible)" },
  { value: "normal", label: "Normal" },
  { value: "important", label: "Important" },
];

type Props = {
  initial?: { title: string; content: string; importance: NotificationImportance };
  onSubmit: (input: {
    title: string;
    content?: string;
    importance: NotificationImportance;
  }) => Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
};

export function NotificationForm({
  initial,
  onSubmit,
  onCancel,
  disabled,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [importance, setImportance] = useState<NotificationImportance>(
    initial?.importance ?? "normal"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit({
      title: title.trim(),
      content: content.trim() || undefined,
      importance,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4"
    >
      <div>
        <label htmlFor="importance" className="block text-sm font-medium text-gray-700 mb-1">
          Niveau d&apos;importance
        </label>
        <select
          id="importance"
          value={importance}
          onChange={(e) => setImportance(e.target.value as NotificationImportance)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          {IMPORTANCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Titre de la notification"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Contenu (optionnel)
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Détails..."
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {initial ? "Enregistrer" : "Créer"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
