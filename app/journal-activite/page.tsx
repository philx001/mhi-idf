import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/supabase/queries";
import { getLoginActivity } from "@/lib/supabase/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function JournalActivitePage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  if (auth.roleInfo.role !== "responsable_siège") {
    redirect("/dashboard");
  }

  const entries = await getLoginActivity();

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Journal d&apos;activité
          </h1>
          <Link
            href="/dashboard"
            className="text-sm text-primary hover:underline"
          >
            ← Tableau de bord
          </Link>
        </div>

        <p className="text-muted-foreground text-sm mb-6">
          Historique des connexions à l&apos;application. Réservé à l&apos;administrateur.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {entries.length} connexion{entries.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucune connexion enregistrée.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium">Date</th>
                      <th className="text-left py-2 px-2 font-medium">Utilisateur</th>
                      <th className="text-left py-2 px-2 font-medium">Email</th>
                      <th className="text-left py-2 px-2 font-medium hidden sm:table-cell">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-2 text-muted-foreground whitespace-nowrap">
                          {formatDate(e.created_at)}
                        </td>
                        <td className="py-2 px-2">
                          {e.display_name || "—"}
                        </td>
                        <td className="py-2 px-2">
                          {e.email || "—"}
                        </td>
                        <td className="py-2 px-2 text-muted-foreground hidden sm:table-cell">
                          {e.ip_address || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
