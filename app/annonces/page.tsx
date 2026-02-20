import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAnnouncements, getUserAndRole } from "@/lib/supabase/queries";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AnnoncesPage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  const { roleInfo } = auth;
  const userIsSiege = roleInfo.isSiege;

  const announcements = await getAnnouncements(50);

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Tableau de bord
          </Link>
          {userIsSiege && (
            <Link
              href="/annonces/nouvelle"
              className="text-green-600 hover:underline text-sm font-medium"
            >
              + Publier une annonce
            </Link>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Annonces du siège
        </h1>

        {userIsSiege && (
          <div className="mb-6">
            <Link
              href="/annonces/nouvelle"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              + Publier une annonce
            </Link>
          </div>
        )}

        {announcements.length === 0 ? (
          <div className="text-gray-600">
            <p>
              Aucune annonce pour le moment. Les annonces officielles du siège
              apparaîtront ici.
            </p>
            {userIsSiege ? (
              <p className="text-sm text-gray-600 mt-2">
                En tant que siège, vous pouvez publier une annonce avec le bouton
                &laquo;&nbsp;+ Publier une annonce&nbsp;&raquo; ci-dessus.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Seul le siège peut publier des annonces.
              </p>
            )}
          </div>
        ) : (
          <ul className="space-y-4">
            {announcements.map((announcement) => (
              <li
                key={announcement.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <Link href={`/annonces/${announcement.id}`} className="block">
                  <p className="font-medium text-gray-900 hover:text-blue-600 hover:underline">
                    {announcement.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(announcement.created_at)}
                  </p>
                  {announcement.content && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {announcement.content}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
