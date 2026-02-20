"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Church } from "@/types/database";

interface CalendarFilterProps {
  churches: Church[];
  selectedChurchId?: string;
  selectedYear?: number;
  selectedMonth?: number;
}

export function CalendarFilter({ churches, selectedChurchId, selectedYear, selectedMonth }: CalendarFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("church", value);
    } else {
      params.delete("church");
    }
    if (selectedYear != null) params.set("year", String(selectedYear));
    if (selectedMonth != null) params.set("month", String(selectedMonth));
    router.push(`/calendar?${params.toString()}`);
  }

  return (
    <div className="mb-6">
      <label htmlFor="church-filter" className="block text-sm font-medium text-gray-700 mb-1">
        Filtrer par église
      </label>
      <select
        id="church-filter"
        value={selectedChurchId ?? ""}
        onChange={handleChange}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Toutes les églises</option>
        {churches.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
