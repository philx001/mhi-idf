"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ email?: string; first_name?: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
        setUser({
          email: u.email,
          first_name: (meta.first_name as string) || (meta.full_name as string) || undefined,
        });
      } else {
        setUser(null);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
        setUser({
          email: u.email,
          first_name: (meta.first_name as string) || (meta.full_name as string) || undefined,
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const displayName =
    user?.first_name?.trim() ||
    (user?.email ? user.email.split("@")[0] : "Profil");

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          "p-2 rounded-lg border border-border bg-background hover:bg-muted transition",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
        title={theme === "dark" ? "Mode clair" : "Mode sombre"}
        aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      >
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-foreground" />
        ) : (
          <Moon className="h-4 w-4 text-foreground" />
        )}
      </button>
      <Link
        href="/profil"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition",
          "text-sm font-medium text-foreground no-underline"
        )}
      >
        <User className="h-4 w-4 shrink-0" />
        <span className="truncate max-w-[120px] sm:max-w-[160px]">
          {displayName}
        </span>
      </Link>
    </div>
  );
}
