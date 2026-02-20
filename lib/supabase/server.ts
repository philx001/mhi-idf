import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Crée un client Supabase pour le serveur.
 * Enveloppé dans cache() pour qu'une seule instance soit créée par requête,
 * ce qui évite des appels répétés à cookies() et réduit fortement le temps de chargement des pages.
 */
async function createClientUncached() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore en mode middleware
          }
        },
      },
    }
  );
}

export const createClient = cache(createClientUncached);
