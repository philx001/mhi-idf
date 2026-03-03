import type { SupabaseClient, User } from "@supabase/supabase-js";

const AUTH_TIMEOUT_MS = 1500;

/**
 * Récupère l'utilisateur avec un timeout pour éviter les blocages
 * si Supabase est lent ou inaccessible.
 */
export async function getUserWithTimeout(
  supabase: SupabaseClient
): Promise<User | null> {
  const { data } = await Promise.race([
    supabase.auth.getUser(),
    new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), AUTH_TIMEOUT_MS)
    ),
  ]);
  return data.user;
}
