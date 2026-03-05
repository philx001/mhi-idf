"use server";

import { revalidatePath } from "next/cache";
import { createDemand as createDemandDb } from "@/lib/supabase/queries";

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
