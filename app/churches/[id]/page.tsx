import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import { getChurchById, isSiege, canEditChurch, getUserChurchId } from "@/lib/supabase/queries";
import { getUsersWithRoles } from "@/app/admin/actions";
import { getChurches } from "@/lib/supabase/queries";
import { ChurchMembersSection } from "./ChurchMembersSection";
import type { Church } from "@/types/database";

export default async function ChurchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUserWithTimeout(supabase);

  if (!user) {
    redirect("/login");
  }

  const [church, userIsSiege, userCanEdit, userChurchId] = await Promise.all([
    getChurchById(id),
    isSiege(),
    canEditChurch(id),
    getUserChurchId(),
  ]);
  const canAccessCalendar = userIsSiege || userChurchId === id;
  const canManageMembers = userIsSiege || (userChurchId === id && userCanEdit);

  if (!church) {
    notFound();
  }

  if (!church.is_active && !userIsSiege) {
    notFound();
  }

  let members: { id: string; email: string | undefined; role: "admin" | "responsable_eglise" | "membre"; church_id: string | null; church_name: string | null; banned: boolean }[] = [];
  let usersWithoutRole: { id: string; email: string | undefined }[] = [];
  let currentUserRole: "admin" | "responsable_eglise" | "membre" | null = null;
  let currentUserChurchId: string | null = null;
  let churchesList: { id: string; name: string }[] = [];

  if (canManageMembers) {
    const [data, churchesData] = await Promise.all([
      getUsersWithRoles({ forChurchPage: id }),
      getChurches(true),
    ]);
    if (!data.error) {
      members = data.users.filter((u) => u.church_id === id);
      usersWithoutRole = data.usersWithoutRole;
      currentUserRole = data.currentUserRole;
      currentUserChurchId = data.currentUserChurchId;
    }
    churchesList = churchesData.map((c) => ({ id: c.id, name: c.name }));
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/churches"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Retour à la liste
          </Link>
          <div className="flex gap-3">
            {canManageMembers && (
              <a
                href="#membres"
                className="text-sm text-blue-600 hover:underline"
              >
                Gérer les membres
              </a>
            )}
            {canAccessCalendar && (
              <Link
                href={`/churches/${church.id}/calendrier`}
                className="text-sm text-blue-600 hover:underline"
              >
                Calendrier
              </Link>
            )}
            {userCanEdit && (
              <Link
                href={`/churches/${church.id}/edit`}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                Modifier le profil
              </Link>
            )}
          </div>
        </div>

        <article className="border border-gray-200 rounded-lg p-6 sm:p-8 bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {church.name}
          </h1>

          {church.description && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {church.description}
              </p>
            </section>
          )}

          {church.specialities && church.specialities.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Spécialités
              </h2>
              <p className="text-gray-700">
                {church.specialities.join(", ")}
              </p>
            </section>
          )}

          {church.contacts &&
            Object.keys(church.contacts).length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Contacts
                </h2>
                <ul className="space-y-1">
                  {Object.entries(church.contacts).map(([key, value]) =>
                    value ? (
                      <li key={key} className="text-gray-700">
                        <span className="font-medium capitalize">
                          {key.replace(/_/g, " ")} :
                        </span>{" "}
                        {key === "email" ? (
                          <a
                            href={`mailto:${value}`}
                            className="text-blue-600 hover:underline"
                          >
                            {value}
                          </a>
                        ) : key === "phone" ? (
                          <a
                            href={`tel:${value}`}
                            className="text-blue-600 hover:underline"
                          >
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </li>
                    ) : null
                  )}
                </ul>
              </section>
            )}

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Programmes et événements
            </h2>
            <p className="text-gray-500 text-sm">
              Consultez le calendrier de l&apos;église pour les événements.
            </p>
          </section>

          {canManageMembers && (
            <ChurchMembersSection
              churchId={id}
              churchName={church.name}
              members={members}
              usersWithoutRole={usersWithoutRole}
              churches={churchesList}
              currentUserRole={currentUserRole}
              currentUserChurchId={currentUserChurchId}
              currentUserId={user.id}
            />
          )}
        </article>
      </div>
    </main>
  );
}
