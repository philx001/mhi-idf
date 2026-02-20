import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/supabase/queries";
import { getChurches } from "@/lib/supabase/queries";
import { getUsersWithRoles } from "../actions";
import { RevokeUserButton } from "./RevokeUserButton";
import { RoleForm } from "./RoleForm";
import { InviteForm } from "./InviteForm";

export default async function GestionUtilisateursPage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }
  if (!auth.roleInfo.isSiege && !auth.roleInfo.isResponsableEglise) {
    redirect("/dashboard");
  }

  const [{ users, usersWithoutRole, currentUserRole, currentUserChurchId, error }, churches] = await Promise.all([
    getUsersWithRoles({ auth }),
    getChurches(false),
  ]);

  const churchList = churches.map((c) => ({ id: c.id, name: c.name }));

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Tableau de bord
          </Link>
          {currentUserRole === "responsable_siège" && <InviteForm />}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion des utilisateurs
        </h1>
        <p className="text-gray-600 text-sm mb-2">
          Inviter des membres, attribuer ou modifier les rôles, révoquer ou restaurer
          l&apos;accès au réseau.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Pour qu’une personne (ex. un contact d’église) apparaisse dans les listes ci-dessous, elle doit d’abord avoir un compte : utilisez <strong>« + Inviter un membre »</strong> pour envoyer une invitation par email. Après acceptation, elle figurera dans « Utilisateurs sans rôle » et vous pourrez lui attribuer un rôle et une église (depuis ici ou depuis le profil de l’église, section Membres).
        </p>

        {error && (
          <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-6">
            {error}
          </p>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Utilisateurs avec rôle
          </h2>
          {users.length === 0 && !error ? (
            <p className="text-gray-600 text-sm">Aucun utilisateur avec rôle.</p>
          ) : (
            <ul className="space-y-3">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {u.email ?? "(sans email)"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {u.role === "responsable_siège" ? "Responsable siège" : u.role === "responsable_eglise" ? "Responsable église" : "Contributeur"}
                        {u.church_name && ` · ${u.church_name}`}
                      </p>
                      {u.banned && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded">
                          Accès révoqué
                        </span>
                      )}
                    </div>
                    <RevokeUserButton
                      userId={u.id}
                      email={u.email ?? "utilisateur"}
                      banned={u.banned}
                      currentUserId={auth.user.id}
                    />
                  </div>
                  <RoleForm
                    mode="edit"
                    userId={u.id}
                    email={u.email ?? ""}
                    churches={churchList}
                    initialRole={u.role}
                    initialChurchId={u.church_id}
                    currentUserRole={currentUserRole}
                    currentUserChurchId={currentUserChurchId}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Utilisateurs sans rôle
          </h2>
          <p className="text-gray-600 text-sm mb-3">
            Utilisateurs inscrits n&apos;ayant pas encore de rôle. Attribuez-leur un rôle
            (Siège ou Contributeur) pour qu&apos;ils accèdent à l&apos;application.
          </p>
          {usersWithoutRole.length === 0 ? (
            <p className="text-gray-600 text-sm">Aucun utilisateur sans rôle.</p>
          ) : (
            <ul className="space-y-3">
              {usersWithoutRole.map((u) => (
                <li
                  key={u.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <p className="font-medium text-gray-900">
                    {u.email ?? "(sans email)"}
                  </p>
                  <RoleForm
                    mode="assign"
                    userId={u.id}
                    email={u.email ?? ""}
                    churches={churchList}
                    currentUserRole={currentUserRole}
                    currentUserChurchId={currentUserChurchId}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-xs text-gray-500 mt-6">
          Les modifications sont enregistrées dans l&apos;historique (audit).
        </p>
      </div>
    </main>
  );
}
