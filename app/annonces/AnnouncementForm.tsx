"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAnnouncement,
  updateAnnouncement,
} from "@/app/annonces/actions";

interface AnnouncementFormProps {
  announcement?: { id: string; title: string; content: string | null };
}

export function AnnouncementForm({ announcement }: AnnouncementFormProps) {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [content, setContent] = useState(announcement?.content ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = announcement
      ? await updateAnnouncement(announcement.id, {
          title,
          content: content || undefined,
        })
      : await createAnnouncement({ title, content: content || undefined });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/annonces");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Titre *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Réunion des responsables"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Contenu
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Détails de l'annonce..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Enregistrement..."
          : announcement
          ? "Enregistrer"
          : "Publier l'annonce"}
      </button>
    </form>
  );
}
