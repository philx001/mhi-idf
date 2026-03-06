"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import { getUserAndRole } from "@/lib/supabase/queries";

const DOCUMENTS_BUCKET = "documents";
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function getCreatorName(meta: Record<string, unknown>): string {
  return [meta.first_name, meta.full_name].filter(Boolean).join(" ").trim() || "Utilisateur";
}

export async function uploadChurchDocument(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { error: "Non authentifié" };

  const churchId = formData.get("church_id") as string;
  const title = (formData.get("title") as string)?.trim();
  const file = formData.get("file") as File;

  if (!churchId || !title || !file?.size) {
    return { error: "Titre et fichier obligatoires." };
  }

  const role = auth.roleInfo.role;
  const userChurchId = auth.roleInfo.churchId;

  const canWrite = role === "admin" || userChurchId === churchId;
  if (!canWrite) {
    return { error: "Vous ne pouvez déposer que dans le dossier de votre église." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: `Taille max : ${MAX_FILE_SIZE_MB} Mo.` };
  }

  const ext = file.name.split(".").pop() || "";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${churchId}/${crypto.randomUUID()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, { upsert: false });

  if (uploadError) return { error: uploadError.message };

  const user = auth.user;
  const meta = (user.user_metadata as Record<string, unknown>) ?? {};
  const creatorName = getCreatorName(meta);

  const { error: insertError } = await supabase.from("church_documents").insert({
    church_id: churchId,
    storage_path: storagePath,
    title,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type || null,
    created_by: user.id,
  });

  if (insertError) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
    return { error: insertError.message };
  }

  revalidatePath("/documents");
  return {};
}

export async function deleteChurchDocument(documentId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { error: "Non authentifié" };

  const { data: doc, error: fetchError } = await supabase
    .from("church_documents")
    .select("church_id, storage_path")
    .eq("id", documentId)
    .single();

  if (fetchError || !doc) return { error: "Document introuvable." };

  const role = auth.roleInfo.role;
  const userChurchId = auth.roleInfo.churchId;
  const canDelete = role === "admin" || userChurchId === doc.church_id;
  if (!canDelete) {
    return { error: "Vous ne pouvez supprimer que les documents de votre église." };
  }

  const { error: deleteDbError } = await supabase
    .from("church_documents")
    .delete()
    .eq("id", documentId);

  if (deleteDbError) return { error: deleteDbError.message };

  await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.storage_path]);

  revalidatePath("/documents");
  return {};
}

export async function getSignedDownloadUrl(storagePath: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const auth = await getUserWithTimeout(supabase);
  if (!auth) return { error: "Non authentifié" };

  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, 60);

  if (error) return { error: error.message };
  return { url: data?.signedUrl };
}
