import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserAndRole } from "@/lib/supabase/queries";
import type { PrayerSession, PrayerSlotSignup } from "@/types/database";
import { PlanningExportClient } from "./PlanningExportClient";

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  prière: "Prière",
  "étude biblique": "Étude biblique",
  culte: "Culte",
  autre: "Autre",
};

const ATTENDANCE_LABELS: Record<string, string> = {
  presentiel: "En présentiel",
  en_ligne: "En ligne",
  autre: "Autre",
};

function formatTime(t: string) {
  const [h, m] = String(t).split(":");
  return `${h}h${m ?? "00"}`;
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Normalise le format d'heure (22:00 ou 22:00:00 → 22:00) pour la correspondance avec les signups. */
function normalizeSlotTime(t: string): string {
  const s = String(t).trim();
  return s.length >= 5 ? s.substring(0, 5) : s;
}

/** Génère les créneaux horaires entre start et end. */
function getSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const sh = parseInt(String(startTime).split(":")[0], 10);
  const eh = parseInt(String(endTime).split(":")[0], 10);
  const crossesMidnight = eh <= sh && (eh !== 0 || sh !== 0);

  if (!crossesMidnight) {
    for (let h = sh; h < eh; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
    }
  } else {
    for (let h = sh; h <= 23; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
    }
    for (let h = 0; h < eh; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
    }
  }
  return slots;
}

export default async function PlanningExportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  const { data: session, error: sessionError } = await supabase
    .from("prayer_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    notFound();
  }

  const { data: signups } = await supabase
    .from("prayer_slot_signups")
    .select("*")
    .eq("prayer_session_id", sessionId)
    .order("slot_time");

  const userIds = [...new Set((signups ?? []).map((s) => s.user_id))];
  const churchIds = [...new Set((signups ?? []).map((s) => s.church_id))];

  let userDisplayNames: Record<string, string> = {};
  let churchNames: Record<string, string> = {};

  try {
    const admin = createAdminClient();
    if (userIds.length > 0) {
      const { data: users } = await admin.auth.admin.listUsers({ perPage: 500 });
      const usersList = users?.users ?? [];
      for (const uid of userIds) {
        const u = usersList.find((x) => x.id === uid);
        const meta = (u?.user_metadata as Record<string, unknown>) ?? {};
        const name =
          [meta.first_name, meta.full_name].filter(Boolean).join(" ").trim() ||
          u?.email ||
          "(utilisateur)";
        userDisplayNames[uid] = name;
      }
    }
    if (churchIds.length > 0) {
      const { data: churches } = await admin.from("churches").select("id, name").in("id", churchIds);
      churchNames = Object.fromEntries((churches ?? []).map((c) => [c.id, c.name]));
    }
  } catch {
    // Fallback si admin non disponible
  }

  const slots = getSlots(session.start_time, session.end_time);
  const signupsBySlot = new Map<string, PrayerSlotSignup[]>();
  for (const s of signups ?? []) {
    const key = normalizeSlotTime(s.slot_time);
    if (!signupsBySlot.has(key)) signupsBySlot.set(key, []);
    signupsBySlot.get(key)!.push(s);
  }

  const programType = session.program_type ?? "prière";
  const attendanceType = session.attendance_type ?? "presentiel";

  return (
    <main className="min-h-screen p-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 print:hidden">
          <Link href="/planning" className="text-blue-600 hover:underline text-sm">
            ← Retour au planning
          </Link>
        </div>

        <PlanningExportClient />

        <div id="planning-export-content" className="print:mt-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {session.title || PROGRAM_TYPE_LABELS[programType] || "Session"}
          </h1>
          <p className="text-gray-600 mb-4">
            {formatDate(session.session_date)} · {formatTime(session.start_time)} →{" "}
            {formatTime(session.end_time)}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {PROGRAM_TYPE_LABELS[programType] || programType}
            </span>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {ATTENDANCE_LABELS[attendanceType] || attendanceType}
            </span>
            {attendanceType === "presentiel" && session.location && (
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-800 rounded">
                {session.location}
              </span>
            )}
          </div>

          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                  Créneau
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                  Inscriptions (max 3 par créneau)
                </th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slotTime) => {
                const slotSignups = signupsBySlot.get(slotTime) ?? [];
                return (
                  <tr key={slotTime}>
                    <td className="border border-gray-300 px-3 py-2 font-medium">
                      {formatTime(slotTime)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {slotSignups.map((su) => (
                          <span
                            key={su.id}
                            className="inline-block px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-xs"
                          >
                            {userDisplayNames[su.user_id] ?? su.user_id}
                            {churchNames[su.church_id] && (
                              <span className="text-gray-500 ml-1">
                                ({churchNames[su.church_id]})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="text-xs text-gray-500 mt-6">
            Planning partagé MHI-IDF · Exporté le {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </main>
  );
}
