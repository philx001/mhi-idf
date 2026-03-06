import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getUserAndRole } from "@/lib/supabase/queries";
import { getChurchDocumentsWithMeta, getChurches, ensureDocumentFoldersForExistingChurches } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { DocumentsContent } from "./DocumentsContent";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  let documents: Awaited<ReturnType<typeof getChurchDocumentsWithMeta>> = [];
  let churches: Awaited<ReturnType<typeof getChurches>> = [];

  try {
    await ensureDocumentFoldersForExistingChurches();
    [documents, churches] = await Promise.all([
      getChurchDocumentsWithMeta(),
      getChurches(false),
    ]);
  } catch {
    return (
      <main className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
            ← Tableau de bord
          </Link>
          <div className="p-6 rounded-lg border border-amber-200 bg-amber-50 text-amber-900">
            <h2 className="font-semibold mb-2">Configuration requise</h2>
            <p className="text-sm mb-4">
              Les migrations pour l&apos;espace Documents partagés n&apos;ont pas encore été exécutées.
              Exécutez les fichiers <code className="bg-amber-100 px-1 rounded">021_church_documents.sql</code> et{" "}
              <code className="bg-amber-100 px-1 rounded">022_storage_documents.sql</code> dans Supabase, puis créez le bucket &quot;documents&quot; (10 Mo max).
            </p>
            <Link href="/dashboard" className={cn("text-sm font-medium text-amber-800 hover:underline")}>
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const role = auth.roleInfo.role;
  const userChurchId = auth.roleInfo.churchId;
  const isAdmin = role === "admin";

  const canWriteChurchIds: string[] = isAdmin
    ? churches.map((c) => c.id)
    : userChurchId
      ? [userChurchId]
      : [];

  const docsByChurch = documents.reduce<Record<string, typeof documents>>((acc, doc) => {
    const id = doc.church_id;
    if (!acc[id]) acc[id] = [];
    acc[id].push(doc);
    return acc;
  }, {});

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Tableau de bord
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Documents partagés
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Chaque église dispose de son propre dossier. Tous les membres peuvent consulter ; seuls les membres de l&apos;église peuvent déposer ou supprimer les documents de sa propre église.
        </p>

        <DocumentsContent
          churches={churches}
          docsByChurch={docsByChurch}
          canWriteChurchIds={canWriteChurchIds}
        />
      </div>
    </main>
  );
}
