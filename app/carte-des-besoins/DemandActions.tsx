"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteDemand } from "./actions";

interface DemandActionsProps {
  demandId: string;
  canEdit: boolean;
}

export function DemandActions({ demandId, canEdit }: DemandActionsProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setDeleteError(null);
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteDemand(demandId);
    setDeleting(false);
    setConfirmDelete(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    router.push("/carte-des-besoins");
    router.refresh();
  }

  if (!canEdit) return null;

  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="flex gap-3 items-center">
        <Link
          href={`/carte-des-besoins/${demandId}/edit`}
          className="text-sm text-blue-600 hover:underline cursor-pointer font-medium"
        >
          Modifier
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`text-sm hover:underline disabled:opacity-50 cursor-pointer ${
            confirmDelete ? "text-red-600 font-medium" : "text-gray-500"
          }`}
        >
          {deleting
            ? "Suppression..."
            : confirmDelete
            ? "Cliquer à nouveau pour confirmer"
            : "Supprimer"}
        </button>
      </div>
      {deleteError && (
        <p className="text-xs text-red-600">{deleteError}</p>
      )}
    </div>
  );
}
