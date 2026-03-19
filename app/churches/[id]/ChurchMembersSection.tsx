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
          Pour créer un nouveau compte, cliquez sur « + Inviter un membre » ci-dessous et choisissez :
        </p>
        <ol className="list-disc list-inside space-y-1 mb-2">
          <li><strong>Option A – Inviter par email</strong> : un lien valable 24 h sera envoyé ; la personne crée son mot de passe en cliquant sur le lien.</li>
          <li><strong>Option B – Créer avec mot de passe</strong> : vous définissez un mot de passe et un rôle (Membre ou Responsable église) ; la personne peut se connecter immédiatement avec le mot de passe que vous lui communiquez.</li>
        </ol>
        <p className="text-amber-800 text-xs">
          L’email de contact de l’église est une simple information du profil : il ne crée pas de compte. Il faut inviter ou créer le compte pour cette adresse.
        </p>
      </div>

      <div className="mb-4">
        <InviteForm defaultChurchId={churchId} />
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">
          Utilisateurs sans rôle : comptes créés (invitation ou inscription) mais pas encore assignés à une église.
        </p>
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
