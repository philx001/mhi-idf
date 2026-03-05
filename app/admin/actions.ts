"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import { getUserAndRole } from "@/lib/supabase/queries";

export type AppRole = "admin" | "responsable_eglise" | "membre";

export type UserWithRole = {
  id: string;
  email: string | undefined;
  role: AppRole;
  church_id: string | null;
  church_name: string | null;
  banned: boolean;
};

export type UserWithoutRole = {
  id: string;
  email: string | undefined;
};

type GetUsersWithRolesOptions = {
  supabase?: Awaited<ReturnType<typeof createClient>>;
  auth?: Awaited<ReturnType<typeof getUserAndRole>> | null;
  /** Pour la page profil église : passer l’id de l’église pour que le responsable d’église reçoive usersWithoutRole (sinon il ne les voit pas). */
  forChurchPage?: string;
  /** Pour le planning partagé : si true (siège ou responsable église de Croissy), retourne tous les utilisateurs avec rôle. */
  forPlanningAllUsers?: boolean;
};

export async function getUsersWithRoles(options?: GetUsersWithRolesOptions): Promise<{
  users: UserWithRole[];
  usersWithoutRole: UserWithoutRole[];
  currentUserRole: AppRole | null;
  currentUserChurchId: string | null;
  error?: string;
}> {
  const supabase = options?.supabase ?? (await createClient());
  const auth = options?.auth !== undefined ? options.auth : await getUserAndRole(supabase);
  if (!auth) {
    return { users: [], usersWithoutRole: [], currentUserRole: null, currentUserChurchId: null, error: "Non authentifié" };
  }
  const { roleInfo } = auth;
  const canAccess =
    roleInfo.isSiege || roleInfo.isResponsableEglise;
  if (!canAccess) {
    return { users: [], usersWithoutRole: [], currentUserRole: roleInfo.role, currentUserChurchId: roleInfo.churchId, error: "Accès refusé" };
  }

  const adminSupabase = createAdminClient();
  const forChurchPage = options?.forChurchPage;

  try {
    const [rolesResult, usersResult] = await Promise.all([
      supabase.from("user_roles").select("user_id, role, church_id"),
      adminSupabase.auth.admin.listUsers({ perPage: 200 }),
    ]);

    if (rolesResult.error) throw rolesResult.error;
    if (usersResult.error) throw usersResult.error;

    const roles = rolesResult.data ?? [];
    let filteredRoles = roles;
    // Responsable d'église : ne voit que les membres de son église (sauf si forPlanningAllUsers pour responsable Croissy).
    if (roleInfo.isResponsableEglise && roleInfo.churchId && !options?.forPlanningAllUsers) {
      filteredRoles = roles.filter((r) => r.church_id === roleInfo.churchId || r.user_id === auth.user.id);
    }

    const authUsers = usersResult.data.users ?? [];
    const churchIds = [...new Set(filteredRoles.map((r) => r.church_id).filter(Boolean))] as string[];

    let churchMap: Record<string, string> = {};
    if (churchIds.length > 0) {
      const { data: churches } = await supabase
        .from("churches")
        .select("id, name")
        .in("id", churchIds);
      churchMap = Object.fromEntries((churches ?? []).map((c) => [c.id, c.name]));
    }

    const roleMap = Object.fromEntries(
      filteredRoles.map((r) => [
        r.user_id,
        {
          role: r.role as AppRole,
          church_id: r.church_id,
          church_name: r.church_id ? churchMap[r.church_id] ?? null : null,
        },
      ])
    );

    const roleUserIds = new Set(filteredRoles.map((r) => r.user_id));
    const authUserMap = Object.fromEntries(authUsers.map((u) => [u.id, u]));

    const users: UserWithRole[] = [...roleUserIds]
      .map((uid) => {
        const r = roleMap[uid];
        const authUser = authUserMap[uid];
        if (!r) return null;
        const banned = authUser?.banned_until
          ? new Date(authUser.banned_until) > new Date()
          : false;
        return {
          id: uid,
          email: authUser?.email,
          role: r.role,
          church_id: r.church_id,
          church_name: r.church_name,
          banned,
        };
      })
      .filter((u): u is UserWithRole => u !== null)
      .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));

    let usersWithoutRole: UserWithoutRole[] = authUsers
      .filter((u) => !roles.some((r) => r.user_id === u.id))
      .filter((u) => !u.banned_until || new Date(u.banned_until) <= new Date())
      .map((u) => ({ id: u.id, email: u.email }))
      .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));

    // Responsable d'église ne voit les « sans rôle » que sur la page profil de son église ou en Gestion utilisateurs (ou tous si Croissy via forPlanningAllUsers).
    if (roleInfo.isResponsableEglise && !options?.forPlanningAllUsers && (!forChurchPage || forChurchPage !== roleInfo.churchId)) {
      usersWithoutRole = [];
    }

    return {
      users,
      usersWithoutRole,
      currentUserRole: roleInfo.role,
      currentUserChurchId: roleInfo.churchId,
    };
  } catch (err) {
    return {
      users: [],
      usersWithoutRole: [],
      currentUserRole: null,
      currentUserChurchId: null,
      error: err instanceof Error ? err.message : "Erreur lors du chargement",
    };
  }
}

async function getCurrentRoleAndChurch(): Promise<{ role: AppRole; churchId: string | null } | null> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return null;
  return { role: auth.roleInfo.role, churchId: auth.roleInfo.churchId };
}

/** Comme getCurrentRoleAndChurch avec isCroissyResponsible (responsable église dont le nom d'église contient "croissy"). */
async function getCurrentRoleChurchAndCroissy(): Promise<{
  role: AppRole;
  churchId: string | null;
  isCroissyResponsible: boolean;
} | null> {
  const current = await getCurrentRoleAndChurch();
  if (!current) return null;
  if (current.role !== "responsable_eglise" || !current.churchId) {
    return { ...current, isCroissyResponsible: false };
  }
  const supabase = await createClient();
  const { data: church } = await supabase
    .from("churches")
    .select("name")
    .eq("id", current.churchId)
    .single();
  const isCroissyResponsible = (church?.name ?? "").toLowerCase().includes("croissy");
  return { ...current, isCroissyResponsible };
}

/** Pour la sidebar : savoir si l’utilisateur peut voir le lien « Gestion des utilisateurs » (siège ou responsable église uniquement). */
export async function getMyRoleForNav(): Promise<{ role: AppRole | null }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { role: null };
  return { role: auth.roleInfo.role };
}

export async function assignRole(
  userId: string,
  role: AppRole,
  churchId: string | null
): Promise<{ error?: string }> {
  const current = await getCurrentRoleChurchAndCroissy();
  if (!current) return { error: "Non authentifié" };
  if (!current.role) return { error: "Accès refusé" };
  const isSiegeUser = current.role === "admin";
  const isEgliseUser = current.role === "responsable_eglise";
  if (!isSiegeUser && !isEgliseUser) return { error: "Accès refusé" };
  if (isEgliseUser) {
    if (role === "admin") return { error: "Seul l'administrateur peut attribuer ce rôle." };
    if (!current.churchId) return { error: "Vous ne pouvez attribuer que pour votre église." };
    if (!current.isCroissyResponsible && churchId !== current.churchId) return { error: "Vous ne pouvez attribuer que pour votre église." };
  }

  if (role !== "admin" && !churchId) {
    return { error: "Une église doit être sélectionnée pour ce rôle." };
  }

  const adminSupabase = createAdminClient();
  const supabase = await createClient();
  const currentUser = await getUserWithTimeout(supabase);
  if (!currentUser) return { error: "Non authentifié" };

  const finalChurchId = role === "admin" ? null : churchId;

  try {
    const { error } = await adminSupabase
      .from("user_roles")
      .upsert(
        { user_id: userId, role, church_id: finalChurchId },
        { onConflict: "user_id" }
      );

    if (error) throw error;

    await adminSupabase.from("audit_log").insert({
      action: "assign_role",
      target_type: "user",
      target_id: userId,
      performed_by: currentUser.id,
      details: { role, church_id: finalChurchId },
    });
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : err instanceof Error
          ? err.message
          : "Erreur lors de l'attribution du rôle";
    return { error: message };
  }

  revalidatePath("/admin/gestion-utilisateurs");
  if (finalChurchId) revalidatePath(`/churches/${finalChurchId}`);
  return {};
}

/** Retirer un utilisateur d'une église (supprime son rôle pour cette église). */
export async function removeUserFromChurch(
  userId: string,
  churchId: string
): Promise<{ error?: string }> {
  const current = await getCurrentRoleChurchAndCroissy();
  if (!current) return { error: "Non authentifié" };
  const isSiegeUser = current.role === "admin";
  const isEgliseUser = current.role === "responsable_eglise";
  if (!isSiegeUser && !isEgliseUser) return { error: "Accès refusé" };
  if (isEgliseUser && !current.isCroissyResponsible && current.churchId !== churchId) {
    return { error: "Vous ne pouvez retirer que des membres de votre église." };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const currentUser = await getUserWithTimeout(supabase);
  if (!currentUser) return { error: "Non authentifié" };
  if (currentUser.id === userId) {
    return { error: "Vous ne pouvez pas vous retirer vous-même. Passez par la Gestion des utilisateurs si besoin." };
  }

  const { data: existing } = await supabase
    .from("user_roles")
    .select("user_id, church_id, role")
    .eq("user_id", userId)
    .eq("church_id", churchId)
    .maybeSingle();

  if (!existing) {
    return { error: "Cet utilisateur n'est pas membre de cette église." };
  }
  if (existing.role === "admin") {
    return { error: "Vous ne pouvez pas supprimer un administrateur." };
  }

  const { error } = await adminSupabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("church_id", churchId);

  if (error) return { error: error.message };

  await adminSupabase.from("audit_log").insert({
    action: "remove_from_church",
    target_type: "user",
    target_id: userId,
    performed_by: currentUser.id,
    details: { church_id: churchId },
  });

  revalidatePath("/admin/gestion-utilisateurs");
  revalidatePath(`/churches/${churchId}`);
  return {};
}

export async function updateUserRole(
  userId: string,
  role: AppRole,
  churchId: string | null
): Promise<{ error?: string }> {
  const current = await getCurrentRoleChurchAndCroissy();
  if (!current) return { error: "Non authentifié" };
  const isSiegeUser = current.role === "admin";
  const isEgliseUser = current.role === "responsable_eglise";
  if (!isSiegeUser && !isEgliseUser) return { error: "Accès refusé" };
  if (isEgliseUser) {
    if (role === "admin") return { error: "Seul l'administrateur peut attribuer ce rôle." };
    if (!current.churchId) return { error: "Vous ne pouvez modifier que pour votre église." };
    if (!current.isCroissyResponsible && churchId !== current.churchId) return { error: "Vous ne pouvez modifier que pour votre église." };
  }

  if (role !== "admin" && !churchId) {
    return { error: "Une église doit être sélectionnée pour ce rôle." };
  }

  const supabase = await createClient();
  const currentUser = await getUserWithTimeout(supabase);
  if (!currentUser) return { error: "Non authentifié" };

  // Un responsable d'église ne peut pas modifier le rôle d'un admin.
  if (isEgliseUser) {
    const { data: target } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
    if (target?.role === "admin") {
      return { error: "Vous ne pouvez pas modifier le rôle d'un administrateur." };
    }
  }

  const adminSupabase = createAdminClient();
  const finalChurchId = role === "admin" ? null : churchId;

  try {
    const { error } = await adminSupabase
      .from("user_roles")
      .update({
        role,
        church_id: finalChurchId,
      })
      .eq("user_id", userId);

    if (error) throw error;

    await adminSupabase.from("audit_log").insert({
      action: "update_role",
      target_type: "user",
      target_id: userId,
      performed_by: currentUser.id,
      details: { role, church_id: finalChurchId },
    });

    revalidatePath("/admin/gestion-utilisateurs");
    if (finalChurchId) revalidatePath(`/churches/${finalChurchId}`);
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la modification du rôle",
    };
  }
}

/**
 * Crée un utilisateur avec email et mot de passe (sans envoi d'email).
 * Option B : le responsable communique le mot de passe à l'utilisateur en personne.
 */
export async function createUserWithPassword(
  email: string,
  password: string,
  churchId?: string | null
): Promise<{ error?: string }> {
  const current = await getCurrentRoleChurchAndCroissy();
  if (!current) return { error: "Non authentifié" };
  const isSiegeUser = current.role === "admin";
  const isEgliseUser = current.role === "responsable_eglise";
  if (!isSiegeUser && !isEgliseUser) return { error: "Accès refusé" };

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  if (isEgliseUser && !current.isCroissyResponsible && current.churchId) {
    if (churchId && churchId !== current.churchId) {
      return { error: "Vous ne pouvez créer que pour votre église." };
    }
    if (!churchId) churchId = current.churchId;
  }

  const adminSupabase = createAdminClient();

  try {
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    });
    if (error) throw error;

    if (data?.user?.id) {
      const supabase = await createClient();
      const currentUser = await getUserWithTimeout(supabase);
      if (currentUser && churchId) {
        const { error: assignErr } = await adminSupabase
          .from("user_roles")
          .upsert(
            { user_id: data.user.id, role: "membre", church_id: churchId },
            { onConflict: "user_id" }
          );
        if (assignErr) {
          return { error: `Compte créé, mais erreur lors de l'attribution du rôle : ${assignErr.message}` };
        }
        await adminSupabase.from("audit_log").insert({
          action: "create_user_with_password",
          target_type: "user",
          target_id: data.user.id,
          performed_by: currentUser.id,
          details: { role: "membre", church_id: churchId },
        });
      }
    }

    revalidatePath("/admin/gestion-utilisateurs");
    if (churchId) revalidatePath(`/churches/${churchId}`);
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur lors de la création du compte";
    if (msg.includes("already been registered") || msg.includes("already exists")) {
      return { error: "Un compte existe déjà pour cet email. Utilisez « Définir mot de passe » si la personne ne peut pas se connecter." };
    }
    return { error: msg };
  }
}

/**
 * Invite un utilisateur par email. Réservé à l'administrateur, responsable Croissy et responsable d'église locale.
 * Si churchId est fourni, le rôle "membre" est attribué automatiquement à cette église.
 */
export async function inviteUserByEmail(
  email: string,
  churchId?: string | null
): Promise<{ error?: string }> {
  const current = await getCurrentRoleChurchAndCroissy();
  if (!current) return { error: "Non authentifié" };
  const isSiegeUser = current.role === "admin";
  const isEgliseUser = current.role === "responsable_eglise";
  if (!isSiegeUser && !isEgliseUser) return { error: "Accès refusé" };

  // Vérifier que le responsable d'église (hors Croissy) ne peut inviter que pour son église
  if (isEgliseUser && !current.isCroissyResponsible && current.churchId) {
    if (churchId && churchId !== current.churchId) {
      return { error: "Vous ne pouvez inviter que pour votre église." };
    }
    // Si pas d'église fournie, utiliser la sienne par défaut
    if (!churchId) churchId = current.churchId;
  }

  const adminSupabase = createAdminClient();
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  try {
    const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${baseUrl}/login`,
    });
    if (error) throw error;
    // Marquer l'email comme confirmé tout de suite pour que l'utilisateur puisse se connecter
    // même si l'email d'invitation n'arrive pas (SMTP par défaut Supabase peu fiable).
    if (data?.user?.id) {
      await adminSupabase.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });
      // Si une église est fournie, attribuer le rôle membre par défaut
      if (churchId) {
        const supabase = await createClient();
        const currentUser = await getUserWithTimeout(supabase);
        if (currentUser) {
          const { error: assignErr } = await adminSupabase
            .from("user_roles")
            .upsert(
              { user_id: data.user.id, role: "membre", church_id: churchId },
              { onConflict: "user_id" }
            );
          if (assignErr) {
            return { error: `Invitation envoyée, mais erreur lors de l'attribution du rôle : ${assignErr.message}` };
          }
          await adminSupabase.from("audit_log").insert({
            action: "assign_role",
            target_type: "user",
            target_id: data.user.id,
            performed_by: currentUser.id,
            details: { role: "membre", church_id: churchId },
          });
        }
      }
    }
    revalidatePath("/admin/gestion-utilisateurs");
    if (churchId) revalidatePath(`/churches/${churchId}`);
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de l'envoi de l'invitation",
    };
  }
}

/**
 * Définit un mot de passe temporaire pour un utilisateur (via API admin Supabase).
 * Utile quand le flux « Mot de passe oublié » échoue (email non reçu, lien expiré par préchargement, etc.).
 */
export async function setUserPassword(
  userId: string,
  newPassword: string
): Promise<{ error?: string }> {
  const current = await getCurrentRoleChurchAndCroissy();
  if (!current) return { error: "Non authentifié" };
  const canSet = current.role === "admin" || current.role === "responsable_eglise";
  if (!canSet) return { error: "Accès refusé" };

  if (newPassword.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  const adminSupabase = createAdminClient();
  const supabase = await createClient();

  try {
    // Si responsable d'église (hors Croissy), vérifier que l'utilisateur appartient à son église
    if (current.role === "responsable_eglise" && current.churchId && !current.isCroissyResponsible) {
      const { data: targetRole } = await supabase
        .from("user_roles")
        .select("church_id")
        .eq("user_id", userId)
        .single();
      if (targetRole?.church_id && targetRole.church_id !== current.churchId) {
        return { error: "Vous ne pouvez définir le mot de passe que pour les membres de votre église." };
      }
    }

    const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) throw error;

    const currentUser = await getUserWithTimeout(supabase);
    if (currentUser) {
      await adminSupabase.from("audit_log").insert({
        action: "set_password",
        target_type: "user",
        target_id: userId,
        performed_by: currentUser.id,
        details: {},
      });
    }

    revalidatePath("/admin/gestion-utilisateurs");
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la définition du mot de passe",
    };
  }
}

export async function revokeUserAccess(userId: string): Promise<{ error?: string }> {
  const current = await getCurrentRoleChurchAndCroissy();
  if (!current) return { error: "Non authentifié" };
  const canRevoke = current.role === "admin" || current.role === "responsable_eglise";
  if (!canRevoke) return { error: "Accès refusé" };

  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const user = await getUserWithTimeout(supabase);

  if (!user) return { error: "Non authentifié" };
  if (user.id === userId) {
    return { error: "Vous ne pouvez pas révoquer votre propre accès." };
  }
  if (current.role === "responsable_eglise" && current.churchId && !current.isCroissyResponsible) {
    const { data: targetRole } = await supabase.from("user_roles").select("role, church_id").eq("user_id", userId).single();
    if (!targetRole || targetRole.church_id !== current.churchId) {
      return { error: "Vous ne pouvez révoquer que les utilisateurs de votre église." };
    }
    if (targetRole.role === "admin") {
      return { error: "Vous ne pouvez pas révoquer un administrateur." };
    }
  }
  if (current.role === "responsable_eglise" && current.isCroissyResponsible) {
    const { data: targetRole } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
    if (targetRole?.role === "admin") {
      return { error: "Vous ne pouvez pas révoquer un administrateur." };
    }
  }

  try {
    const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });

    if (error) throw error;

    await adminSupabase.from("audit_log").insert({
      action: "revoke_user",
      target_type: "user",
      target_id: userId,
      performed_by: user.id,
      details: {},
    });

    revalidatePath("/admin/gestion-utilisateurs");
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la révocation",
    };
  }
}

export async function restoreUserAccess(userId: string): Promise<{ error?: string }> {
  const current = await getCurrentRoleChurchAndCroissy();
  if (!current) return { error: "Non authentifié" };
  const canRestore = current.role === "admin" || current.role === "responsable_eglise";
  if (!canRestore) return { error: "Accès refusé" };

  const supabase = await createClient();
  if (current.role === "responsable_eglise" && current.churchId && !current.isCroissyResponsible) {
    const { data: targetRole } = await supabase.from("user_roles").select("church_id").eq("user_id", userId).single();
    if (!targetRole || targetRole.church_id !== current.churchId) {
      return { error: "Vous ne pouvez restaurer que les utilisateurs de votre église." };
    }
  }

  const adminSupabase = createAdminClient();
  const user = await getUserWithTimeout(supabase);

  if (!user) return { error: "Non authentifié" };

  try {
    const { error } = await adminSupabase.auth.admin.updateUserById(userId, {
      ban_duration: "none",
    });

    if (error) throw error;

    await adminSupabase.from("audit_log").insert({
      action: "restore_user",
      target_type: "user",
      target_id: userId,
      performed_by: user.id,
      details: {},
    });

    revalidatePath("/admin/gestion-utilisateurs");
    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erreur lors de la restauration",
    };
  }
}
