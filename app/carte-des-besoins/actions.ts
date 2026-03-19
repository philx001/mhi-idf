"use server";

import { revalidatePath } from "next/cache";
import {
  createDemand as createDemandDb,
  updateDemand as updateDemandDb,
  deleteDemand as deleteDemandDb,
  canEditDemand,
} from "@/lib/supabase/queries";

export async function createDemand(input: {
  church_id: string;
  types: string[];
  title: string;
  description?: string;
  importance?: string | null;
}): Promise<{ error?: string }> {
  try {
    await createDemandDb(input);
    revalidatePath("/carte-des-besoins");
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la création",
    };
  }
}

export async function updateDemand(
  id: string,
  input: { types?: string[]; title?: string; description?: string | null; importance?: string | null }
): Promise<{ error?: string }> {
  try {
    const canEdit = await canEditDemand(id);
    if (!canEdit) return { error: "Vous n'avez pas le droit de modifier cette demande." };
    await updateDemandDb(id, input);
    revalidatePath("/carte-des-besoins");
    revalidatePath(`/carte-des-besoins/${id}`);
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la modification",
    };
  }
}

export async function deleteDemand(id: string): Promise<{ error?: string }> {
  try {
    const canEdit = await canEditDemand(id);
    if (!canEdit) return { error: "Vous n'avez pas le droit de supprimer cette demande." };
    await deleteDemandDb(id);
    revalidatePath("/carte-des-besoins");
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la suppression",
    };
  }
}
