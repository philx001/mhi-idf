import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole, getDirectoryMembers } from "@/lib/supabase/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "./MemberAvatar";
import { isAdminDisplayAsResponsable, ADMIN_DISPLAY_AS_RESPONSABLE } from "@/lib/admin-display-config";

export default async function AnnuairePage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  let members = await getDirectoryMembers();
  // Pour les non-admins : l'admin est affiché avec "Eglise de Croissy" comme église
  if (!auth.roleInfo.isSiege) {
    members = members.map((m) =>
      isAdminDisplayAsResponsable(m.email)
        ? { ...m, church_name: ADMIN_DISPLAY_AS_RESPONSABLE.displayChurchName }
        : m
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Annuaire</h1>
          <Link
            href="/dashboard"
            className="text-sm text-primary hover:underline"
          >
            ← Tableau de bord
          </Link>
        </div>

        <p className="text-muted-foreground text-sm mb-6">
          Répertoire des membres du réseau. Les informations proviennent des profils personnels.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {members.length} membre{members.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucun membre pour le moment. Complétez votre profil pour apparaître dans l&apos;annuaire.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition"
                  >
                    <div className="shrink-0">
                      <MemberAvatar avatarUrl={m.avatar_url} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {[m.first_name?.trim(), m.full_name?.trim()].filter(Boolean).join(" ") || "—"}
                      </p>
                      {m.phone && (
                        <p className="text-sm text-muted-foreground">
                          <a
                            href={`tel:${m.phone.replace(/\s/g, "")}`}
                            className="hover:text-primary hover:underline"
                          >
                            {m.phone}
                          </a>
                        </p>
                      )}
                      {m.church_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {m.church_name}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-4">
          Pour mettre à jour vos informations, allez dans{" "}
          <Link href="/profil" className="text-primary hover:underline">
            Mon profil
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
