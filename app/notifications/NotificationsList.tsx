"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Notification, NotificationImportance } from "@/types/database";
import { createNotification, updateNotification, deleteNotification } from "./actions";
import { NotificationForm } from "./NotificationForm";

const IMPORTANCE_ORDER: NotificationImportance[] = ["urgente", "important", "normal", "info"];

type Props = {
  notifications: Notification[];
  canEditMap: Record<string, boolean>;
  importanceLabels: Record<string, string>;
};

export function NotificationsList({
  notifications,
  canEditMap,
  importanceLabels,
}: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const sorted = [...notifications].sort(
    (a, b) =>
      IMPORTANCE_ORDER.indexOf(a.importance as NotificationImportance) -
      IMPORTANCE_ORDER.indexOf(b.importance as NotificationImportance)
  );

  const handleCreate = async (input: {
    title: string;
    content?: string;
    importance: NotificationImportance;
  }) => {
    setBusy(true);
    setMessage(null);
    const result = await createNotification(input);
    setBusy(false);
    if (result.error) {
      setMessage({ type: "err", text: result.error });
    } else {
      setShowForm(false);
      setMessage({ type: "ok", text: "Notification créée. En cas d'urgence, un email a été envoyé aux responsables d'églises." });
      router.refresh();
    }
  };

  const handleUpdate = async (
    id: string,
    input: { title?: string; content?: string; importance?: NotificationImportance }
  ) => {
    setBusy(true);
    setMessage(null);
    const result = await updateNotification(id, input);
    setBusy(false);
    if (result.error) {
      setMessage({ type: "err", text: result.error });
    } else {
      setEditingId(null);
      setMessage({ type: "ok", text: "Notification mise à jour." });
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette notification ?")) return;
    setBusy(true);
    setMessage(null);
    const result = await deleteNotification(id);
    setBusy(false);
    if (result.error) {
      setMessage({ type: "err", text: result.error });
    } else {
      setMessage({ type: "ok", text: "Notification supprimée." });
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setShowForm((v) => !v)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        disabled={busy}
      >
        + Nouvelle notification
      </button>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <NotificationForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          disabled={busy}
        />
      )}

      {sorted.length === 0 && !showForm ? (
        <p className="text-gray-600">Aucune notification.</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((n) => (
            <li
              key={n.id}
              className={`border rounded-lg p-4 ${
                n.importance === "urgente"
                  ? "border-red-200 bg-red-50/50"
                  : n.importance === "important"
                  ? "border-amber-200 bg-amber-50/30"
                  : "border-gray-200 bg-white"
              }`}
            >
              {editingId === n.id ? (
                <NotificationForm
                  initial={{ title: n.title, content: n.content ?? "", importance: n.importance as NotificationImportance }}
                  onSubmit={(input) => handleUpdate(n.id, input)}
                  onCancel={() => setEditingId(null)}
                  disabled={busy}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded mb-1 ${
                          n.importance === "urgente"
                            ? "bg-red-100 text-red-800"
                            : n.importance === "important"
                            ? "bg-amber-100 text-amber-800"
                            : n.importance === "normal"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {importanceLabels[n.importance] ?? n.importance}
                      </span>
                      <h3 className="font-medium text-gray-900">{n.title}</h3>
                      {n.content && (
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                          {n.content}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(n.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {canEditMap[n.id] && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(n.id)}
                          className="text-sm text-blue-600 hover:underline"
                          disabled={busy}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(n.id)}
                          className="text-sm text-red-600 hover:underline"
                          disabled={busy}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
