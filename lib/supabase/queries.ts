import { cache } from "react";
import { createClient } from "./server";
import { getUserWithTimeout } from "./auth";
import type {
  Church,
  EventWithChurch,
  DemandWithChurch,
  ProposalWithChurch,
  PrayerSession,
  PrayerSlotSignup,
  Notification,
} from "@/types/database";

export async function getChurches(
  activeOnly = true,
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<Church[]> {
  const client = supabase ?? (await createClient());
  let query = client
    .from("churches")
    .select("*")
    .order("name");

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Church[];
}

export async function getChurchById(id: string): Promise<Church | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("churches")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Church;
}

export type UserRoleInfo = {
  role: "responsable_siège" | "responsable_eglise" | "contributeur";
  isResponsableSiege: boolean;
  isResponsableEglise: boolean;
  /** Alias pour isResponsableSiege (droits niveau siège). */
  isSiege: boolean;
  churchId: string | null;
};

/**
 * Récupère l'utilisateur et son rôle en un seul appel (optimise les performances).
 * En cache par requête pour éviter des appels auth + user_roles en double.
 */
async function getUserAndRoleUncached(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ user: import("@supabase/supabase-js").User; roleInfo: UserRoleInfo } | null> {
  const user = await getUserWithTimeout(supabase);
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role, church_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[getUserAndRole] user_roles query error:", error.code, error.message);
  }

  const role = (data?.role as "responsable_siège" | "responsable_eglise" | "contributeur") ?? "contributeur";
  const churchId = data?.church_id ?? null;
  const isResponsableSiege = role === "responsable_siège";
  const isResponsableEglise = role === "responsable_eglise";

  return {
    user,
    roleInfo: {
      role,
      isResponsableSiege,
      isResponsableEglise,
      isSiege: isResponsableSiege,
      churchId,
    },
  };
}

export const getUserAndRole = cache(getUserAndRoleUncached);

export async function isSiege(
  supabase?: Awaited<ReturnType<typeof createClient>>,
  userId?: string
): Promise<boolean> {
  const client = supabase ?? (await createClient());
  const uid =
    userId ?? (await getUserWithTimeout(client))?.id;
  if (!uid) return false;

  const { data } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", uid)
    .single();

  return data?.role === "responsable_siège";
}

export async function getUserChurchId(
  supabase?: Awaited<ReturnType<typeof createClient>>,
  userId?: string
): Promise<string | null> {
  const client = supabase ?? (await createClient());
  const uid =
    userId ?? (await getUserWithTimeout(client))?.id;
  if (!uid) return null;

  const { data } = await client
    .from("user_roles")
    .select("church_id, role")
    .eq("user_id", uid)
    .single();

  if ((data?.role === "contributeur" || data?.role === "responsable_eglise") && data.church_id) {
    return data.church_id;
  }
  return null;
}

export async function canEditChurch(churchId: string): Promise<boolean> {
  const [userIsResponsableSiege, userChurchId] = await Promise.all([
    isSiege(),
    getUserChurchId(),
  ]);
  return userIsResponsableSiege || userChurchId === churchId;
}

export async function createChurch(input: {
  name: string;
  description?: string;
  contacts?: Record<string, string>;
  specialities?: string[];
}): Promise<Church> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("churches")
    .insert({
      name: input.name,
      description: input.description ?? null,
      contacts: input.contacts ?? {},
      specialities: input.specialities ?? [],
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as Church;
}

async function enrichEventsWithChurch(
  events: EventWithChurch[],
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<EventWithChurch[]> {
  if (events.length === 0) return [];
  const client = supabase ?? (await createClient());
  const churchIds = [...new Set(events.map((e) => e.church_id))];
  const { data: churches } = await client
    .from("churches")
    .select("id, name")
    .in("id", churchIds);
  const churchMap = Object.fromEntries(
    (churches ?? []).map((c) => [c.id, { name: c.name }])
  );
  return events.map((e) => ({
    ...e,
    church: churchMap[e.church_id] ?? null,
  }));
}

export async function getUpcomingEvents(
  limit = 10,
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<EventWithChurch[]> {
  const client = supabase ?? (await createClient());
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("visibility", "shared")
    .gte("event_date", today)
    .order("event_date")
    .order("event_time")
    .limit(limit);

  if (error) throw error;
  return enrichEventsWithChurch((data ?? []) as EventWithChurch[], client);
}

export async function canEditEvent(eventId: string): Promise<boolean> {
  const supabase = await createClient();
  const user = await getUserWithTimeout(supabase);
  if (!user) return false;

  const { data: event } = await supabase
    .from("events")
    .select("church_id")
    .eq("id", eventId)
    .single();

  if (!event) return false;

  const [userIsSiege, userChurchId] = await Promise.all([
    isSiege(),
    getUserChurchId(),
  ]);
  return userIsSiege || userChurchId === event.church_id;
}

export async function getEventById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function getCalendarEvents(limit = 100): Promise<EventWithChurch[]> {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 7);
  const toDate = new Date(today);
  toDate.setMonth(toDate.getMonth() + 3);
  const fromStr = fromDate.toISOString().split("T")[0];
  const toStr = toDate.toISOString().split("T")[0];
  return getSharedEventsForSynthetic(fromStr, toStr, limit);
}

/** Événements partagés uniquement, pour le calendrier synthétique (toutes églises). */
export async function getSharedEventsForSynthetic(
  fromDate: string,
  toDate: string,
  limit = 500,
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<EventWithChurch[]> {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("visibility", "shared")
    .gte("event_date", fromDate)
    .lte("event_date", toDate)
    .order("event_date")
    .order("event_time")
    .limit(limit);

  if (error) throw error;
  return enrichEventsWithChurch((data ?? []) as EventWithChurch[], client);
}

/** Événements d’une église (privés + partagés) pour son calendrier. Accès vérifié côté page. */
export async function getEventsForChurchCalendar(
  churchId: string,
  fromDate: string,
  toDate: string
): Promise<EventWithChurch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("church_id", churchId)
    .gte("event_date", fromDate)
    .lte("event_date", toDate)
    .order("event_date")
    .order("event_time");

  if (error) throw error;
  return enrichEventsWithChurch((data ?? []) as EventWithChurch[]);
}

export async function updateChurch(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    contacts: Record<string, string>;
    specialities: string[];
    is_active: boolean;
  }>
): Promise<Church> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("churches")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Church;
}

// --- Epic 4: Carte des besoins ---

async function enrichDemandsWithChurch(
  demands: DemandWithChurch[]
): Promise<DemandWithChurch[]> {
  if (demands.length === 0) return [];
  const supabase = await createClient();
  const churchIds = [...new Set(demands.map((d) => d.church_id))];
  const { data: churches } = await supabase
    .from("churches")
    .select("id, name")
    .in("id", churchIds);
  const churchMap = Object.fromEntries(
    (churches ?? []).map((c) => [c.id, { name: c.name }])
  );
  return demands.map((d) => ({
    ...d,
    church: churchMap[d.church_id] ?? null,
  }));
}

export async function getDemands(type?: string): Promise<DemandWithChurch[]> {
  const supabase = await createClient();
  let query = supabase
    .from("demands")
    .select("*")
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return enrichDemandsWithChurch((data ?? []) as DemandWithChurch[]);
}

export async function getDemandById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("demands")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function createDemand(input: {
  church_id: string;
  type: "intervenant" | "salle" | "ressource";
  title: string;
  description?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("demands")
    .insert({
      ...input,
      description: input.description ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProposalsByDemandId(
  demandId: string
): Promise<ProposalWithChurch[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("demand_id", demandId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) return [];
  const churchIds = [...new Set(data.map((p) => p.church_id))];
  const { data: churches } = await supabase
    .from("churches")
    .select("id, name")
    .in("id", churchIds);
  const churchMap = Object.fromEntries(
    (churches ?? []).map((c) => [c.id, { name: c.name }])
  );
  return data.map((p) => ({
    ...p,
    church: churchMap[p.church_id] ?? null,
  })) as ProposalWithChurch[];
}

export async function createProposal(input: {
  demand_id: string;
  church_id: string;
  description?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      ...input,
      description: input.description ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function canEditDemand(demandId: string): Promise<boolean> {
  const supabase = await createClient();
  const user = await getUserWithTimeout(supabase);
  if (!user) return false;

  const { data: demand } = await supabase
    .from("demands")
    .select("church_id")
    .eq("id", demandId)
    .single();

  if (!demand) return false;

  const [userIsSiege, userChurchId] = await Promise.all([
    isSiege(),
    getUserChurchId(),
  ]);
  return userIsSiege || userChurchId === demand.church_id;
}

// --- Epic 5: Annonces du siège ---

export async function getAnnouncements(
  limit = 50,
  supabase?: Awaited<ReturnType<typeof createClient>>
) {
  const client = supabase ?? (await createClient());
  const { data, error } = await client
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as import("@/types/database").Announcement[];
}

export async function getAnnouncementById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as import("@/types/database").Announcement;
}

export async function createAnnouncement(input: {
  title: string;
  content?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      ...input,
      content: input.content ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAnnouncement(
  id: string,
  input: { title?: string; content?: string }
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

// --- Planning de prière ---

export async function getPrayerSessions(params?: {
  from?: string;
  to?: string;
  limit?: number;
}): Promise<PrayerSession[]> {
  const supabase = await createClient();
  let query = supabase
    .from("prayer_sessions")
    .select("*")
    .order("session_date")
    .order("start_time");

  if (params?.from) query = query.gte("session_date", params.from);
  if (params?.to) query = query.lte("session_date", params.to);
  if (params?.limit) query = query.limit(params.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PrayerSession[];
}

export async function getPrayerSlotSignups(sessionIds: string[]): Promise<PrayerSlotSignup[]> {
  if (sessionIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prayer_slot_signups")
    .select("*")
    .in("prayer_session_id", sessionIds)
    .order("slot_time");

  if (error) throw error;
  return (data ?? []) as PrayerSlotSignup[];
}

// --- Notifications ---

export async function getNotifications(
  params?: { limit?: number },
  supabase?: Awaited<ReturnType<typeof createClient>>
): Promise<Notification[]> {
  const client = supabase ?? (await createClient());
  let query = client
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (params?.limit) query = query.limit(params.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Notification[];
}
