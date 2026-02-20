"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteAnnouncement } from "@/app/annonces/actions";

interface AnnouncementActionsProps {
  announcementId: string;
}

export function AnnouncementActions({ announcementId }: AnnouncementActionsProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setError(null);
      return;
    }
    setDeleting(true);
    setError(null);
    const result = await deleteAnnouncement(announcementId);
    setDeleting(false);
    setConfirmDelete(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/annonces");
    router.refresh();
  }

  return (
    <div className="flex gap-3 items-center">
      <Link
        href={`/annonces/${announcementId}/edit`}
        className="text-sm text-blue-600 hover:underline font-medium"
      >
        Modifier
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={`text-sm hover:underline disabled:opacity-50 ${
          confirmDelete ? "text-red-600 font-medium" : "text-gray-500"
        }`}
      >
        {deleting
          ? "Suppression..."
          : confirmDelete
          ? "Cliquer à nouveau pour confirmer"
          : "Supprimer"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
