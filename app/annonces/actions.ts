"use server";

import { revalidatePath } from "next/cache";
import {
  createAnnouncement as createAnnouncementDb,
  updateAnnouncement as updateAnnouncementDb,
  deleteAnnouncement as deleteAnnouncementDb,
  isSiege,
} from "@/lib/supabase/queries";

export async function createAnnouncement(input: {
  title: string;
  content?: string;
}): Promise<{ error?: string }> {
  const siege = await isSiege();
  if (!siege) {
    return { error: "Accès refusé. Réservé au siège." };
  }
  try {
    await createAnnouncementDb(input);
    revalidatePath("/annonces");
    revalidatePath("/dashboard");
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la publication",
    };
  }
}

export async function updateAnnouncement(
  id: string,
  input: { title?: string; content?: string }
): Promise<{ error?: string }> {
  const siege = await isSiege();
  if (!siege) {
    return { error: "Accès refusé. Réservé au siège." };
  }
  try {
    await updateAnnouncementDb(id, input);
    revalidatePath("/annonces");
    revalidatePath(`/annonces/${id}`);
    revalidatePath("/dashboard");
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la modification",
    };
  }
}

export async function deleteAnnouncement(id: string): Promise<{ error?: string }> {
  const siege = await isSiege();
  if (!siege) {
    return { error: "Accès refusé. Réservé au siège." };
  }
  try {
    await deleteAnnouncementDb(id);
    revalidatePath("/annonces");
    revalidatePath("/dashboard");
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la suppression",
    };
  }
}
