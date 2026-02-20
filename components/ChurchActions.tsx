"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ChurchActionsProps {
  churchId: string;
  churchName: string;
  canDeactivate: boolean;
  isActive?: boolean;
}

export function ChurchActions({
  churchId,
  churchName,
  canDeactivate,
  isActive = true,
}: ChurchActionsProps) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    if (isActive && !confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("churches")
      .update({
        is_active: !isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", churchId);
    router.push("/churches");
    router.refresh();
    setLoading(false);
    setConfirm(false);
  }

  if (!canDeactivate) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`text-sm hover:underline disabled:opacity-50 ${
          confirm && isActive ? "text-red-600 font-medium" : "text-gray-500"
        }`}
      >
        {loading
          ? "..."
          : isActive
          ? confirm
            ? "Cliquer à nouveau pour confirmer la désactivation"
            : `Désactiver « ${churchName} »`
          : `Réactiver « ${churchName} »`}
      </button>
    </div>
  );
}
