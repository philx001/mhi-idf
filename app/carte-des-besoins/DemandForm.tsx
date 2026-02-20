"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDemand } from "@/app/carte-des-besoins/actions";
import type { Church } from "@/types/database";
import type { DemandType } from "@/types/database";

const DEMAND_TYPES: { value: DemandType; label: string }[] = [
  { value: "intervenant", label: "Intervenant" },
  { value: "salle", label: "Salle" },
  { value: "ressource", label: "Ressource" },
];

interface DemandFormProps {
  churches: Church[];
}

export function DemandForm({ churches }: DemandFormProps) {
  const [churchId, setChurchId] = useState(churches[0]?.id ?? "");
  const [type, setType] = useState<DemandType>("intervenant");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createDemand({
      church_id: churchId,
      type,
      title,
      description: description || undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/carte-des-besoins");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="church"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Église *
        </label>
        <select
          id="church"
          value={churchId}
          onChange={(e) => setChurchId(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {churches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Type *
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as DemandType)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {DEMAND_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

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
          placeholder="Ex: Besoin d'un prédicateur pour le dimanche"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Détails de la demande..."
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
        {loading ? "Création..." : "Créer la demande"}
      </button>
    </form>
  );
}
