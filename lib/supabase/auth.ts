import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Délai max pour getuser (10 s). Trop court = déconnexions aléatoires si Supabase lent. */
const AUTH_TIMEOUT_MS = 10_000;

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
