import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/supabase/queries";
import { getChurches } from "@/lib/supabase/queries";
import { getUsersWithRoles } from "../actions";
import { RevokeUserButton } from "./RevokeUserButton";
import { RemoveFromChurchButton } from "@/app/churches/[id]/RemoveFromChurchButton";
import { RoleForm } from "./RoleForm";
import { InviteForm } from "./InviteForm";
import { SetPasswordButton } from "./SetPasswordButton";
import { isAdminDisplayAsResponsable, ADMIN_DISPLAY_AS_RESPONSABLE } from "@/lib/admin-display-config";

export default async function GestionUtilisateursPage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }
  if (!auth.roleInfo.isResponsableEglise && !auth.roleInfo.isSiege) {
    redirect("/dashboard");
  }

  const churches = await getChurches(false);
  const isCroissyResponsible = Boolean(
    auth.roleInfo.churchId &&
    churches.find((c) => c.id === auth.roleInfo.churchId)?.name?.toLowerCase().includes("croissy")
  );
  const canManageAllChurches = auth.roleInfo.isSiege || isCroissyResponsible;

  const { users, usersWithoutRole, currentUserRole, currentUserChurchId, error } = await getUsersWithRoles({
    auth,
    forPlanningAllUsers: canManageAllChurches,
    forChurchPage: canManageAllChurches ? undefined : (auth.roleInfo.churchId ?? undefined),
  });

  const churchList = canManageAllChurches
    ? churches.map((c) => ({ id: c.id, name: c.name }))
    : churches.filter((c) => c.id === auth.roleInfo.churchId).map((c) => ({ id: c.id, name: c.name }));

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Tableau de bord
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion des utilisateurs
        </h1>
        <p className="text-gray-600 text-sm mb-2">
          Inviter des membres, attribuer ou modifier les rôles, révoquer ou restaurer
          l&apos;accès au réseau.
        </p>
        <p className="hidden">
          Pour qu’une personne (ex. un contact d’église) apparaisse dans les listes ci-dessous, elle doit d’abord avoir un compte (l&apos;invitation par email est réservée à l&apos;administrateur). Une fois le compte créé, la personne figurera dans « Utilisateurs sans rôle » et vous pourrez lui attribuer un rôle et une église (depuis ici ou depuis le profil de l’église, section Membres).
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Invitez des membres par email (lien valable 24 h). Une fois le compte créé, attribuez un rôle et une église si besoin (depuis ici ou depuis le profil de l&apos;église, section Membres).
        </p>
        <div className="mb-6">
          <InviteForm
            defaultChurchId={!canManageAllChurches && auth.roleInfo.churchId ? auth.roleInfo.churchId : null}
            churches={canManageAllChurches ? churchList : []}
          />
        </div>
        {canManageAllChurches ? (
          <p className="text-sm text-blue-800 bg-blue-50 px-4 py-2 rounded-lg mb-4">
            {auth.roleInfo.isSiege
              ? "En tant qu&apos;administrateur, vous pouvez voir et modifier tous les membres du réseau."
              : "En tant que responsable de l&apos;église de Croissy, vous pouvez voir et modifier tous les membres du réseau, quelle que soit leur église."}
          </p>
        ) : (
          <p className="text-sm text-blue-800 bg-blue-50 px-4 py-2 rounded-lg mb-4">
            Vous ne voyez que les membres de <strong>votre église</strong>. Vous pouvez bloquer temporairement ou supprimer un membre.
          </p>
        )}

        {error && (
          <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-6">
            {error}
          </p>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Utilisateurs avec rôle
            {!canManageAllChurches && " (membres de votre église)"}
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
                        {auth.roleInfo.isSiege
                          ? (u.role === "admin" || u.role === "responsable_siège" ? "Admin" : u.role === "responsable_eglise" ? "Responsable église" : "Contributeur") + (u.church_name ? ` · ${u.church_name}` : "")
                          : isAdminDisplayAsResponsable(u.email)
                          ? `${ADMIN_DISPLAY_AS_RESPONSABLE.displayLabel} · ${ADMIN_DISPLAY_AS_RESPONSABLE.displayChurchName}`
                          : (u.role === "responsable_eglise" ? "Responsable église" : "Contributeur") + (u.church_name ? ` · ${u.church_name}` : "")}
                      </p>
                      {u.banned && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded">
                          Accès révoqué
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {!(isAdminDisplayAsResponsable(u.email) && !auth.roleInfo.isSiege) && (
                        <>
                          <SetPasswordButton userId={u.id} email={u.email ?? "utilisateur"} />
                          <RevokeUserButton
                            userId={u.id}
                            email={u.email ?? "utilisateur"}
                            banned={u.banned}
                            currentUserId={auth.user.id}
                          />
                          {u.church_id &&
                            u.role !== "admin" &&
                            u.role !== "responsable_siège" &&
                            auth.user.id !== u.id && (
                              <RemoveFromChurchButton
                                userId={u.id}
                                churchId={u.church_id}
                                email={u.email ?? "utilisateur"}
                              />
                            )}
                        </>
                      )}
                    </div>
                  </div>
                  {/* Responsable d'église ne peut pas modifier un administrateur. L'admin masqué n'affiche pas le formulaire pour les non-admins. */}
                  {!(isAdminDisplayAsResponsable(u.email) && !auth.roleInfo.isSiege) && (
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
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Utilisateurs sans rôle
          </h2>
          {canManageAllChurches ? (
            <>
              <p className="text-gray-600 text-sm mb-3">
                Utilisateurs inscrits n&apos;ayant pas encore de rôle. Attribuez-leur un rôle (Responsable église ou Contributeur) et une église pour qu&apos;ils accèdent à l&apos;application.
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
                      <div className="flex flex-wrap items-center gap-3">
                        <SetPasswordButton userId={u.id} email={u.email ?? "utilisateur"} />
                        <RevokeUserButton
                          userId={u.id}
                          email={u.email ?? "utilisateur"}
                          banned={false}
                          currentUserId={auth.user.id}
                        />
                        <RoleForm
                          mode="assign"
                          userId={u.id}
                          email={u.email ?? ""}
                          churches={churchList}
                          currentUserRole={currentUserRole}
                          currentUserChurchId={currentUserChurchId}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-sm p-4 bg-gray-50 rounded-lg border border-gray-200">
              Pour ajouter un nouveau membre à votre église, invitez-le avec le bouton ci-dessus puis attribuez-lui un rôle et votre église ici, ou allez dans <strong>Profils des églises</strong> → votre église → section <strong>Membres</strong>.
            </p>
          )}
        </section>

        <p className="text-xs text-gray-500 mt-6">
          Les modifications sont enregistrées dans l&apos;historique (audit).
        </p>
      </div>
    </main>
  );
}
