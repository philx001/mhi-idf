"use server";

import { revalidatePath } from "next/cache";
import { createProposal as createProposalDb } from "@/lib/supabase/queries";

export async function createProposal(input: {
  demand_id: string;
  church_id: string;
  description?: string;
}): Promise<{ error?: string }> {
  try {
    await createProposalDb(input);
    revalidatePath("/carte-des-besoins");
    revalidatePath(`/carte-des-besoins/${input.demand_id}`);
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la proposition",
    };
  }
}
