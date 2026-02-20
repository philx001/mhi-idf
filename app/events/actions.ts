"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { canEditEvent, isSiege } from "@/lib/supabase/queries";

export async function deleteEvent(eventId: string): Promise<{ error?: string }> {
  const canEdit = await canEditEvent(eventId);
  if (!canEdit) {
    return { error: "Vous n'avez pas l'autorisation de supprimer cet événement." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/churches");
  return {};
}

/** Marquer / démarquer un événement comme "principal" pour le calendrier synthétique. Réservé au siège. */
export async function setEventMain(
  eventId: string,
  isMain: boolean
): Promise<{ error?: string }> {
  const siege = await isSiege();
  if (!siege) {
    return { error: "Seul le responsable siège peut modifier ce réglage." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ is_main: isMain, updated_at: new Date().toISOString() })
    .eq("id", eventId);

  if (error) return { error: error.message };
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return {};
}
