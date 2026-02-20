"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeClient() {
  const [user, setUser] = useState<boolean | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setUser(!!user));
  }, []);

  if (user === null) {
    return (
      <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
        Connexion
      </Link>
    );
  }

  return (
    <Link
      href={user ? "/dashboard" : "/login"}
      className={cn(buttonVariants({ size: "lg" }))}
    >
      {user ? "Tableau de bord" : "Connexion"}
    </Link>
  );
}
