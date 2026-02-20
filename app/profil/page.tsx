import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/supabase/queries";
import { ProfilClient } from "./ProfilClient";

export default async function ProfilPage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) redirect("/login");

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Mon profil</h1>
      <ProfilClient
        user={{
          id: auth.user.id,
          email: auth.user.email ?? "",
          user_metadata: (auth.user as { user_metadata?: Record<string, unknown> })
            .user_metadata ?? {},
        }}
      />
    </div>
  );
}
