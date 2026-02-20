import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec service_role pour les opérations admin (révocation utilisateur).
 * À utiliser UNIQUEMENT côté serveur. Ne jamais exposer la clé service_role au client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquant. Configurer dans .env.local pour la gestion des utilisateurs."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
