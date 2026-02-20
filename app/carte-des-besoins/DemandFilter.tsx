"use client";

import { useRouter, useSearchParams } from "next/navigation";

const DEMAND_TYPE_LABELS: Record<string, string> = {
  "": "Tous les types",
  intervenant: "Intervenant",
  salle: "Salle",
  ressource: "Ressource",
};

export function DemandFilter({ selectedType }: { selectedType?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    router.push(`/carte-des-besoins?${params.toString()}`);
  }

  return (
    <div className="mb-6">
      <label
        htmlFor="demand-filter"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Filtrer par type
      </label>
      <select
        id="demand-filter"
        value={selectedType ?? ""}
        onChange={handleChange}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {Object.entries(DEMAND_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
