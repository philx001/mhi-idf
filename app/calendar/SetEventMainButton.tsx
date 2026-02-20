"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setEventMain } from "@/app/events/actions";

interface SetEventMainButtonProps {
  eventId: string;
  isMain: boolean;
  label?: string;
}

export function SetEventMainButton({
  eventId,
  isMain,
  label = "Principal",
}: SetEventMainButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    setError(null);
    const { error: err } = await setEventMain(eventId, !isMain);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`text-xs px-2 py-1 rounded border ${
          isMain
            ? "bg-amber-100 border-amber-300 text-amber-800"
            : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
        } disabled:opacity-50`}
        title={isMain ? "Retirer des programmes principaux" : "Marquer comme programme principal"}
      >
        {loading ? "..." : isMain ? "★ Principal" : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
