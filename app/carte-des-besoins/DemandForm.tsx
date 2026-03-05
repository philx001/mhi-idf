"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDemand } from "@/app/carte-des-besoins/actions";
import type { Church } from "@/types/database";
import type { DemandType, DemandImportance } from "@/types/database";

const DEMAND_TYPES: { value: DemandType; label: string }[] = [
  { value: "intervenant", label: "Intervenant" },
  { value: "salle", label: "Salle" },
  { value: "ressource", label: "Ressources Diverses" },
  { value: "financier", label: "Financier" },
  { value: "conseil", label: "Conseil" },
  { value: "aide_logistique", label: "Aide Logistique" },
  { value: "ressources_spirituelles", label: "Ressources Spirituelles" },
  { value: "autre", label: "Autre" },
];

const IMPORTANCE_OPTIONS: { value: DemandImportance; label: string }[] = [
  { value: "faible", label: "Faible" },
  { value: "moyen", label: "Moyen" },
  { value: "eleve", label: "Élevé" },
  { value: "urgent", label: "Urgent" },
];

interface DemandFormProps {
  churches: Church[];
}

export function DemandForm({ churches }: DemandFormProps) {
  const [churchId, setChurchId] = useState(churches[0]?.id ?? "");
  const [types, setTypes] = useState<DemandType[]>(["intervenant"]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState<DemandImportance | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function toggleType(t: DemandType) {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (types.length === 0) {
      setError("Sélectionnez au moins un type.");
      return;
    }
    setLoading(true);

    const result = await createDemand({
      church_id: churchId,
      types,
      title,
      description: description || undefined,
      importance: importance || undefined,
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
        <span className="block text-sm font-medium text-gray-700 mb-2">
          Type(s) * (plusieurs choix possibles)
        </span>
        <div className="flex flex-wrap gap-3">
          {DEMAND_TYPES.map((t) => (
            <label
              key={t.value}
              className="flex items-center gap-2 cursor-pointer rounded-lg border-2 px-3 py-2 transition border-gray-200 hover:border-gray-300"
            >
              <input
                type="checkbox"
                checked={types.includes(t.value)}
                onChange={() => toggleType(t.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-800">
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="importance"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Urgence / Importance
        </label>
        <select
          id="importance"
          value={importance}
          onChange={(e) =>
            setImportance((e.target.value || "") as DemandImportance | "")
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Non précisé</option>
          {IMPORTANCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
