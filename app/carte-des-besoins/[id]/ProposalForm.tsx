"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProposal } from "./actions";
import type { Church } from "@/types/database";

interface ProposalFormProps {
  demandId: string;
  churches: Church[];
  demandChurchId: string;
}

export function ProposalForm({
  demandId,
  churches,
  demandChurchId,
}: ProposalFormProps) {
  const availableChurches = churches.filter((c) => c.id !== demandChurchId);
  const [churchId, setChurchId] = useState(
    availableChurches[0]?.id ?? churches[0]?.id ?? ""
  );
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createProposal({
      demand_id: demandId,
      church_id: churchId,
      description: description || undefined,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setDescription("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-medium text-gray-700">
        Proposer une ressource
      </h3>
      <div>
        <label
          htmlFor="church"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mon église *
        </label>
        <select
          id="church"
          value={churchId}
          onChange={(e) => setChurchId(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availableChurches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
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
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Nous pouvons prêter notre salle le samedi..."
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
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? "Envoi..." : "Proposer"}
      </button>
    </form>
  );
}
