"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Délai d'inactivité avant déconnexion automatique (15 minutes, fixe). */
const INACTIVITY_MS = 15 * 60 * 1000;
/** Ne pas réinitialiser le timer plus d'une fois par seconde (évite surcharge). */
const THROTTLE_MS = 1000;

export function InactivityLogout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const logout = useCallback(() => {
    const supabase = createClient();
    supabase.auth.signOut().finally(() => {
      router.replace("/login");
    });
  }, [router]);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < THROTTLE_MS) return;
    lastActivityRef.current = now;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(logout, INACTIVITY_MS);
  }, [logout]);

  useEffect(() => {
    resetTimer();

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click", "focus"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [resetTimer]);

  return <>{children}</>;
}
