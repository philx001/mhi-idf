"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Church } from "@/types/database";
import type { ChurchDocumentWithMeta } from "@/types/database";
import { uploadChurchDocument, deleteChurchDocument, getSignedDownloadUrl } from "./actions";
import { Church as ChurchIcon, Upload, Trash2, Download, ChevronDown, ChevronUp } from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const COLLAPSIBLE_THRESHOLD = 5;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

type Props = {
  churches: Church[];
  docsByChurch: Record<string, ChurchDocumentWithMeta[]>;
  canWriteChurchIds: string[];
};

export function DocumentsContent({ churches, docsByChurch, canWriteChurchIds }: Props) {
  const router = useRouter();
  const [uploadingChurchId, setUploadingChurchId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedChurchIds, setExpandedChurchIds] = useState<Set<string>>(new Set());

  function toggleChurchExpanded(churchId: string) {
    setExpandedChurchIds((prev) => {
      const next = new Set(prev);
      if (next.has(churchId)) next.delete(churchId);
      else next.add(churchId);
      return next;
    });
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>, churchId: string) {
    e.preventDefault();
    setUploadError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("church_id", churchId);

    const file = formData.get("file") as File;
    if (!file?.size) {
      setUploadError("Sélectionnez un fichier.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`Taille max : ${MAX_FILE_SIZE_MB} Mo.`);
      return;
    }
    const title = (formData.get("title") as string)?.trim();
    if (!title) {
      setUploadError("Le titre est obligatoire.");
      return;
    }

    setUploadingChurchId(churchId);
    const { error } = await uploadChurchDocument(formData);
    setUploadingChurchId(null);
    if (error) {
      setUploadError(error);
      return;
    }
    form.reset();
    router.refresh();
  }

  async function handleDelete(docId: string) {
    if (!confirm("Supprimer ce document ?")) return;
    setDeletingId(docId);
    const { error } = await deleteChurchDocument(docId);
    setDeletingId(null);
    if (error) alert(error);
    else router.refresh();
  }

  async function handleDownload(doc: ChurchDocumentWithMeta) {
    const { url, error } = await getSignedDownloadUrl(doc.storage_path);
    if (error) {
      alert(error);
      return;
    }
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    }
  }

  return (
    <div className="space-y-8">
      {churches.map((church) => {
        const docs = docsByChurch[church.id] ?? [];
        const canWrite = canWriteChurchIds.includes(church.id);
        const isCollapsible = docs.length > COLLAPSIBLE_THRESHOLD;
        const isExpanded = expandedChurchIds.has(church.id);

        const headerContent = (
          <CardTitle className="flex items-center gap-2 text-lg">
            <ChurchIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="flex-1">{church.name}</span>
            {isCollapsible && (
              <span className="text-sm font-normal text-muted-foreground">
                ({docs.length} document{docs.length > 1 ? "s" : ""})
              </span>
            )}
            {isCollapsible && (
              isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )
            )}
          </CardTitle>
        );

        const cardContent = (
          <CardContent className="space-y-4">
            {canWrite && (
              <form
                onSubmit={(e) => handleUpload(e, church.id)}
                className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg bg-muted/50"
              >
                <input
                  type="text"
                  name="title"
                  placeholder="Titre du document *"
                  required
                  className="flex-1 min-w-0 px-3 py-2 text-sm border border-input rounded-md bg-background"
                />
                <input
                  type="file"
                  name="file"
                  className="flex-1 min-w-0 text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium"
                />
                <button
                  type="submit"
                  disabled={!!uploadingChurchId}
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "shrink-0")}
                >
                  {uploadingChurchId === church.id ? (
                    "Envoi..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      Déposer
                    </>
                  )}
                </button>
              </form>
            )}
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Taille max : {MAX_FILE_SIZE_MB} Mo. Tous types de fichiers.
            </p>

            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Aucun document dans ce dossier.
              </p>
            ) : (
              <ul className="space-y-2">
                {docs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.creator_name} · {formatDate(doc.created_at)} · {formatSize(doc.file_size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {canWrite && (
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id)}
                          disabled={!!deletingId}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-destructive hover:text-destructive")}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        );

        return (
          <Card key={church.id} className="border-border">
            <CardHeader
              className={cn(
                "pb-2",
                isCollapsible && "cursor-pointer hover:bg-muted/30 rounded-lg transition-colors"
              )}
              onClick={isCollapsible ? () => toggleChurchExpanded(church.id) : undefined}
            >
              {headerContent}
            </CardHeader>
            {(!isCollapsible || isExpanded) && cardContent}
          </Card>
        );
      })}
    </div>
  );
}
