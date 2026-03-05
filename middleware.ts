import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Délai max pour rafraîchir la session (5 s). Trop court = perte de session au chargement. */
const SESSION_REFRESH_TIMEOUT_MS = 5_000;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Pages publiques : pas d'appel Supabase pour affichage immédiat
  if (path === "/" || path === "/login") {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options as Record<string, unknown>)
              );
            } catch {
              // Ignore en mode middleware
            }
          },
        },
      }
    );
    await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), SESSION_REFRESH_TIMEOUT_MS)
      ),
    ]);
  } catch {
    // Timeout ou erreur : on continue sans bloquer
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
