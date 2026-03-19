import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getChurches, getUserAndRole } from "@/lib/supabase/queries";
import type { Church } from "@/types/database";

export default async function ChurchesPage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  const { roleInfo } = auth;
  const userIsSiege = roleInfo.isSiege;
  const userChurchId = roleInfo.churchId ?? null;

  const churches = await getChurches(false);

  // Admin : toutes les églises. Responsable : uniquement son église.
  const canEditMap = Object.fromEntries(
    churches.map((c) => [
      c.id,
      userIsSiege || (userChurchId === c.id && roleInfo.isResponsableEglise),
    ])
  );
  const canEditOwnChurch = !!userChurchId && roleInfo.isResponsableEglise;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Profils des églises
          </h1>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:underline"
            >
              ← Tableau de bord
            </Link>
            {userIsSiege && (
              <Link
                href="/churches/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Nouvelle église
              </Link>
            )}
          </div>
        </div>

        {canEditOwnChurch && (
          <p className="mb-6 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-4">
            En tant que responsable de votre église, vous pouvez <strong>modifier le profil de votre église</strong> (nom, description, contacts, spécialités) en cliquant sur « Modifier » ou « Membres » sur la carte de votre église.
          </p>
        )}

        {churches.length === 0 ? (
          <p className="text-gray-600">
            Aucune église enregistrée.
            {userIsSiege && " Cliquez sur « Nouvelle église » pour en créer une."}
          </p>
        ) : (
          <ul className="space-y-4">
            {churches.map((church) => (
              <ChurchCard
                key={church.id}
                church={church}
                canEdit={canEditMap[church.id] ?? false}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function ChurchCard({
  church,
  canEdit,
}: {
  church: Church;
  canEdit: boolean;
}) {
  return (
    <li className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between gap-4">
        <Link
          href={`/churches/${church.id}`}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 hover:underline">
              {church.name}
            </h2>
            {!church.is_active && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                Désactivée
              </span>
            )}
          </div>
          {church.description && (
            <p className="text-gray-600 mt-1 text-sm line-clamp-2">
              {church.description}
            </p>
          )}
          {church.specialities.length > 0 && (
            <p className="text-gray-500 mt-2 text-sm">
              {church.specialities.join(", ")}
            </p>
          )}
        </Link>
        {canEdit && (
          <div className="flex gap-3 shrink-0">
            <Link
              href={`/churches/${church.id}#membres`}
              className="text-sm text-blue-600 hover:underline"
            >
              Membres
            </Link>
            <Link
              href={`/churches/${church.id}/edit`}
              className="text-sm text-blue-600 hover:underline"
            >
              Modifier
            </Link>
          </div>
        )}
      </div>
    </li>
  );
}
