"use client";

import Link from "next/link";
import { RoleForm } from "@/app/admin/gestion-utilisateurs/RoleForm";
import { assignRole, type AppRole, type UserWithRole } from "@/app/admin/actions";
import { AddChurchMemberForm } from "./AddChurchMemberForm";
import { RemoveFromChurchButton } from "./RemoveFromChurchButton";
import { RevokeUserButton } from "@/app/admin/gestion-utilisateurs/RevokeUserButton";
import { InviteForm } from "@/app/admin/gestion-utilisateurs/InviteForm";

type UserWithoutRole = { id: string; email: string | undefined };
type Church = { id: string; name: string };

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  responsable_siège: "Admin",
  responsable_eglise: "Responsable église",
  membre: "Membre",
};

interface ChurchMembersSectionProps {
  churchId: string;
  churchName: string;
  members: UserWithRole[];
  usersWithoutRole: UserWithoutRole[];
  churches: Church[];
  currentUserRole: AppRole | null;
  currentUserChurchId: string | null;
  currentUserId?: string;
}

export function ChurchMembersSection({
  churchId,
  churchName,
  members,
  usersWithoutRole,
  churches,
  currentUserRole,
  currentUserChurchId,
  currentUserId,
}: ChurchMembersSectionProps) {
  return (
    <section id="membres" className="mt-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Membres de cette église
      </h2>
      <p className="text-gray-600 text-sm mb-2">
        Utilisateurs ayant un rôle pour l’église « {churchName} ».
      </p>
      <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
        <p className="font-medium mb-1">La personne n’apparaît pas dans la liste ?</p>
        <p className="mb-2">
          Seules les personnes qui ont déjà un compte dans l’application (inscrit ou invité) peuvent être ajoutées ici. Pour ajouter quelqu’un qui n’a pas encore de compte :
        </p>
        <ol className="list-decimal list-inside space-y-1 mb-2">
          <li>Cliquez sur <strong>« + Inviter un membre »</strong> ci-dessous et saisissez son email. Un email lui sera envoyé (lien 24 h) et il sera ajouté comme membre. Ou allez dans la{" "}
            <Link href="/admin/gestion-utilisateurs" className="text-blue-600 hover:underline font-medium">
              Gestion des utilisateurs
            </Link>{" "}
            (lien dans le tableau de bord).
          </li>
          <li>Une fois qu’il aura accepté l’invitation par email, il apparaîtra dans « membres ».</li>
        </ol>
        <p className="text-amber-800 text-xs">
          L’email de contact de l’église (ex. contact_cergy@gmail.com) est uniquement une information du profil : il ne crée pas de compte. Il faut inviter cette adresse pour qu’elle devienne utilisateur.
        </p>
      </div>

      <div className="mb-4">
        <InviteForm defaultChurchId={churchId} />
      </div>

      <div className="mb-4">
        <AddChurchMemberForm
          churchId={churchId}
          usersWithoutRole={usersWithoutRole}
          currentUserRole={currentUserRole}
        />
      </div>

      {members.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun membre pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <span className="font-medium text-gray-900">
                  {m.email ?? "(sans email)"}
                </span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {ROLE_LABELS[m.role]}
                </span>
                {m.banned && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                    Accès révoqué
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <RevokeUserButton
                  userId={m.id}
                  email={m.email ?? "utilisateur"}
                  banned={m.banned}
                  currentUserId={currentUserId}
                />
                <RoleForm
                  mode="edit"
                  userId={m.id}
                  email={m.email ?? ""}
                  churches={churches}
                  initialRole={m.role}
                  initialChurchId={m.church_id}
                  currentUserRole={currentUserRole}
                  currentUserChurchId={currentUserChurchId}
                />
                {!m.banned && m.role !== "admin" && (
                  <RemoveFromChurchButton
                    userId={m.id}
                    churchId={churchId}
                    email={m.email ?? ""}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
