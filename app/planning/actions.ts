"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserAndRole, getPrayerSessions, getPrayerSlotSignups } from "@/lib/supabase/queries";
import type { PrayerSession, PrayerSlotSignup } from "@/types/database";
import { getUsersWithRoles } from "@/app/admin/actions";

/** Résout les user_id en emails pour l'affichage (utilise admin). En cas d'erreur, retourne un map vide. */
async function getEmailsForUserIds(userIds: string[]): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const users = data?.users ?? [];
    const map: Record<string, string> = {};
    for (const uid of userIds) {
      const u = users.find((x) => x.id === uid);
      map[uid] = u?.email ?? "(utilisateur)";
    }
    return map;
  } catch {
    return {};
  }
}

export type PlanningPageData = {
  sessions: PrayerSession[];
  signups: PrayerSlotSignup[];
  userDisplayNames: Record<string, string>;
  canCreateSession: boolean;
  canAddSignup: boolean;
  churchMembers: { id: string; email: string }[];
  currentUserId: string | null;
  error?: string;
};

export async function getPlanningPageData(params?: {
  from?: string;
  to?: string;
}): Promise<PlanningPageData> {
  try {
    const supabase = await createClient();
    const auth = await getUserAndRole(supabase);

    if (!auth) {
      return {
        sessions: [],
        signups: [],
        userDisplayNames: {},
        canCreateSession: false,
        canAddSignup: false,
        churchMembers: [],
        currentUserId: null,
        error: "Non authentifié",
      };
    }

    const { user, roleInfo } = auth;
    const canCreateSession = roleInfo.isSiege;
    const canAddSignup = roleInfo.isSiege || roleInfo.isResponsableEglise;

    const from = params?.from ?? new Date().toISOString().split("T")[0];
    const to = params?.to;
    const sessions = await getPrayerSessions({
      from,
      to: to ?? (() => {
        const d = new Date(from);
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString().split("T")[0];
      })(),
      limit: 200,
    });

    const today = new Date().toISOString().split("T")[0];
    const sortedSessions = [...sessions].sort((a, b) => {
      const da = a.session_date;
      const db = b.session_date;
      const aUpcoming = da >= today;
      const bUpcoming = db >= today;
      if (aUpcoming && bUpcoming) return da.localeCompare(db);
      if (!aUpcoming && !bUpcoming) return db.localeCompare(da);
      return aUpcoming ? -1 : 1;
    });

    const sessionIds = sortedSessions.map((s) => s.id);
    const signups = await getPrayerSlotSignups(sessionIds);

    const userIds = [...new Set(signups.map((s) => s.user_id))];
    const userDisplayNames = await getEmailsForUserIds(userIds);

    let churchMembers: { id: string; email: string }[] = [];
    if (canAddSignup) {
      try {
        // Siège : tous les utilisateurs. Responsable église : seulement les membres de son église, sauf responsable de l'église de Croissy qui voit tous.
        const isCroissyResponsible =
          roleInfo.isResponsableEglise &&
          roleInfo.churchId &&
          (async () => {
            const { data } = await supabase
              .from("churches")
              .select("name")
              .eq("id", roleInfo.churchId)
              .single();
            return (data?.name ?? "").toLowerCase().includes("croissy");
          })();
        const useAllUsers =
          roleInfo.isSiege || (await isCroissyResponsible);
        const usersData = await getUsersWithRoles({
          forPlanningAllUsers: useAllUsers,
        });
        if (!usersData.error && usersData.users.length > 0) {
          const filtered =
            roleInfo.isResponsableEglise &&
            roleInfo.churchId &&
            !useAllUsers
              ? usersData.users.filter(
                  (u) => u.church_id === roleInfo.churchId || u.id === user.id
                )
              : usersData.users;
          churchMembers = filtered.map((u) => ({
            id: u.id,
            email: u.email ?? "(sans email)",
          }));
        }
      } catch {
        // Liste des membres non disponible (ex. clé admin manquante)
      }
    }

    return {
      sessions: sortedSessions,
      signups,
      userDisplayNames,
      canCreateSession,
      canAddSignup,
      churchMembers,
      currentUserId: user.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    const hint = message.includes("prayer_sessions") || message.includes("prayer_slot_signups")
      ? " Exécutez la migration 012_prayer_planning.sql dans Supabase (SQL Editor)."
      : "";
    return {
      sessions: [],
      signups: [],
      userDisplayNames: {},
      canCreateSession: false,
      canAddSignup: false,
      churchMembers: [],
      currentUserId: null,
      error: `Erreur lors du chargement du planning : ${message}.${hint}`,
    };
  }
}

export async function createPrayerSession(input: {
  session_date: string;
  start_time: string;
  end_time: string;
  title?: string;
  program_type?: "prière" | "étude biblique" | "culte" | "autre";
  attendance_type?: "presentiel" | "en_ligne" | "autre";
  location?: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { error: "Non authentifié" };
  if (!auth.roleInfo.isSiege) return { error: "Seul l'administrateur peut créer une session." };

  const { error } = await supabase.from("prayer_sessions").insert({
    session_date: input.session_date,
    start_time: input.start_time,
    end_time: input.end_time,
    title: input.title ?? null,
    program_type: input.program_type ?? "prière",
    attendance_type: input.attendance_type ?? "presentiel",
    location: input.location?.trim() || null,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/planning");
  return {};
}

export async function deletePrayerSession(sessionId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { error: "Non authentifié" };
  if (!auth.roleInfo.isSiege) return { error: "Seul l'administrateur peut supprimer une session." };

  const { error } = await supabase
    .from("prayer_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) return { error: error.message };
  revalidatePath("/planning");
  return {};
}

export async function addPrayerSignup(input: {
  prayer_session_id: string;
  slot_time: string;
  user_id: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { error: "Non authentifié" };
  if (!auth.roleInfo.isSiege && !auth.roleInfo.isResponsableEglise) {
    return { error: "Seuls les responsables peuvent ajouter des inscriptions." };
  }

  const { error } = await supabase.from("prayer_slot_signups").insert({
    prayer_session_id: input.prayer_session_id,
    slot_time: input.slot_time,
    user_id: input.user_id,
    added_by_user_id: auth.user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/planning");
  return {};
}

export async function removePrayerSignup(signupId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);
  if (!auth) return { error: "Non authentifié" };

  const { data: signup, error: fetchError } = await supabase
    .from("prayer_slot_signups")
    .select("added_by_user_id, user_id")
    .eq("id", signupId)
    .single();

  if (fetchError || !signup) return { error: "Inscription introuvable." };
  if (signup.added_by_user_id !== auth.user.id && signup.user_id !== auth.user.id) {
    return { error: "Vous ne pouvez supprimer que vos propres inscriptions." };
  }

  const { error } = await supabase.from("prayer_slot_signups").delete().eq("id", signupId);
  if (error) return { error: error.message };
  revalidatePath("/planning");
  return {};
}
