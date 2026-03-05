"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

/**
 * Enregistre une connexion dans le journal d'activité.
 * Appelé après un login réussi. L'utilisateur doit être authentifié.
 */
export async function recordLoginActivity(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headersList.get("x-real-ip")
    || null;
  const userAgent = headersList.get("user-agent") || null;

  await supabase.from("login_activity").insert({
    user_id: user.id,
    ip_address: ip,
    user_agent: userAgent,
  });
}
