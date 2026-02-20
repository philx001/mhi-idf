export type UserRole = "responsable_siège" | "responsable_eglise" | "contributeur";

export interface Church {
  id: string;
  name: string;
  description: string | null;
  contacts: Record<string, string>;
  specialities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: UserRole;
  church_id: string | null;
  created_at: string;
}

export type EventType = "culte" | "etude_biblique" | "evenement" | "autre";

export type EventVisibility = "private" | "shared";

export interface Event {
  id: string;
  church_id: string;
  title: string;
  type: EventType;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
  visibility: EventVisibility;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventWithChurch extends Event {
  church: { name: string } | null;
}

export type DemandType = "intervenant" | "salle" | "ressource";

export interface Demand {
  id: string;
  church_id: string;
  type: DemandType;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  demand_id: string;
  church_id: string;
  description: string | null;
  created_at: string;
}

export interface DemandWithChurch extends Demand {
  church: { name: string } | null;
}

export interface ProposalWithChurch extends Proposal {
  church: { name: string } | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

// --- Planning (sessions partagées : prière, culte, etc.) ---

export type PlanningProgramType = "prière" | "étude biblique" | "culte" | "autre";
export type PlanningAttendanceType = "presentiel" | "en_ligne" | "autre";

export interface PrayerSession {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  title: string | null;
  program_type?: PlanningProgramType;
  attendance_type?: PlanningAttendanceType;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrayerSlotSignup {
  id: string;
  prayer_session_id: string;
  slot_time: string;
  church_id: string;
  user_id: string;
  added_by_user_id: string;
  created_at: string;
}

// --- Notifications (tableau de bord) ---

export type NotificationImportance = "info" | "normal" | "important" | "urgente";

export interface Notification {
  id: string;
  title: string;
  content: string | null;
  importance: NotificationImportance;
  created_by: string;
  created_at: string;
  updated_at: string;
}
