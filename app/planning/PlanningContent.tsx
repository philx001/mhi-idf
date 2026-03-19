"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type {
  PrayerSession,
  PrayerSlotSignup,
  PlanningProgramType,
  PlanningAttendanceType,
} from "@/types/database";
import {
  createPrayerSession,
  deletePrayerSession,
  addPrayerSignup,
  removePrayerSignup,
} from "./actions";
import { AddSessionForm } from "./AddSessionForm";
import { AddSignupForm } from "./AddSignupForm";

function formatTime(t: string) {
  const [h, m] = String(t).split(":");
  return `${h}h${m ?? "00"}`;
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

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

const VISIBLE_SESSIONS_INITIAL = 5;

/** Normalise le format d'heure (22:00 ou 22:00:00 → 22:00) pour la correspondance avec les signups. */
function normalizeSlotTime(t: string): string {
  const s = String(t).trim();
  return s.length >= 5 ? s.substring(0, 5) : s;
}

/** Génère les créneaux horaires entre start et end (par pas d'1h). Gère le passage à minuit. */
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

type Props = {
  sessions: PrayerSession[];
  signups: PrayerSlotSignup[];
  userDisplayNames: Record<string, string>;
  churchNames: Record<string, string>;
  canCreateSession: boolean;
  canAddSignup: boolean;
  churchMembers: { id: string; email: string }[];
  currentUserId: string | null;
  userChurchId: string | null;
  isResponsableEglise: boolean;
  filterFrom?: string;
  filterTo?: string;
  filterMonth?: string;
  threeMonthsAgoStr: string;
  todayStr: string;
  endOfCurrentMonthStr: string;
  twelveMonthsLaterStr: string;
};

export function PlanningContent({
  sessions,
  signups,
  userDisplayNames,
  churchNames,
  canCreateSession,
  canAddSignup,
  churchMembers,
  currentUserId,
  userChurchId,
  isResponsableEglise,
  filterFrom,
  filterTo,
  filterMonth,
  threeMonthsAgoStr,
  todayStr,
  endOfCurrentMonthStr,
  twelveMonthsLaterStr,
}: Props) {
  const router = useRouter();
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [addSignupFor, setAddSignupFor] = useState<{
    sessionId: string;
    slotTime: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const signupsBySessionSlot = new Map<string, PrayerSlotSignup[]>();
  for (const s of signups) {
    const slotNorm = normalizeSlotTime(s.slot_time);
    const key = `${s.prayer_session_id}|${slotNorm}`;
    if (!signupsBySessionSlot.has(key)) signupsBySessionSlot.set(key, []);
    signupsBySessionSlot.get(key)!.push(s);
  }

  const handleCreateSession = async (input: {
    session_date: string;
    start_time: string;
    end_time: string;
    title?: string;
    program_type?: PlanningProgramType;
    attendance_type?: PlanningAttendanceType;
    location?: string;
  }) => {
    setBusy(true);
    setMessage(null);
    const result = await createPrayerSession(input);
    setBusy(false);
    if (result.error) {
      setMessage({ type: "err", text: result.error });
    } else {
      setShowAddSession(false);
      setMessage({ type: "ok", text: "Session créée." });
      router.refresh();
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Supprimer cette session de prière et toutes les inscriptions ?")) return;
    setBusy(true);
    setMessage(null);
    const result = await deletePrayerSession(sessionId);
    setBusy(false);
    if (result.error) setMessage({ type: "err", text: result.error });
    else {
      setMessage({ type: "ok", text: "Session supprimée." });
      router.refresh();
    }
  };

  const handleAddSignup = async (input: {
    prayer_session_id: string;
    slot_time: string;
    user_id: string;
  }) => {
    setBusy(true);
    setMessage(null);
    const result = await addPrayerSignup(input);
    setBusy(false);
    if (result.error) {
      setMessage({ type: "err", text: result.error });
    } else {
      setAddSignupFor(null);
      setMessage({ type: "ok", text: "Inscription ajoutée." });
      router.refresh();
    }
  };

  const handleRemoveSignup = async (signupId: string) => {
    if (!confirm("Retirer cette inscription ?")) return;
    setBusy(true);
    setMessage(null);
    const result = await removePrayerSignup(signupId);
    setBusy(false);
    if (result.error) setMessage({ type: "err", text: result.error });
    else {
      setMessage({ type: "ok", text: "Inscription retirée." });
      router.refresh();
    }
  };

  const next3Months = (() => {
    const d = new Date(todayStr);
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  })();
  const isDefaultRange =
    filterFrom === threeMonthsAgoStr && filterTo === endOfCurrentMonthStr;
  const isCurrentView3Months =
    filterFrom === todayStr && filterTo === next3Months;
  const isCurrentViewYear =
    filterFrom === todayStr && filterTo === twelveMonthsLaterStr;
  const isOlderView = filterTo && filterTo < threeMonthsAgoStr;
  const oldestDate = "2020-01-01";

  const currentYear = new Date().getFullYear();
  const [monthFilter, setMonthFilter] = useState(() => {
    if (!filterMonth || !/^\d{4}-\d{2}$/.test(filterMonth)) return "";
    return filterMonth.split("-")[1]!;
  });
  const [yearFilter, setYearFilter] = useState(() => {
    if (!filterMonth || !/^\d{4}-\d{2}$/.test(filterMonth)) return currentYear;
    return parseInt(filterMonth.split("-")[0]!, 10);
  });
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 3 + i);
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        {canCreateSession && (
          <button
            type="button"
            onClick={() => setShowAddSession((v) => !v)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            disabled={busy}
          >
            + Nouvelle session
          </button>
        )}
        <Link
          href="/planning"
          className={`px-4 py-2 rounded-lg font-medium text-sm transition text-center ${
            isDefaultRange
              ? "bg-blue-100 text-blue-800 border border-blue-300 cursor-default"
              : "border border-blue-600 text-blue-600 hover:bg-blue-50"
          }`}
        >
          Période par défaut (3 derniers mois + mois en cours)
        </Link>
        <Link
          href={`/planning?from=${todayStr}&to=${next3Months}`}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition text-center ${
            isCurrentView3Months
              ? "bg-blue-100 text-blue-800 border border-blue-300 cursor-default"
              : "border border-blue-600 text-blue-600 hover:bg-blue-50"
          }`}
        >
          Voir les 3 prochains mois
        </Link>
        <Link
          href={`/planning?from=${todayStr}&to=${twelveMonthsLaterStr}`}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition text-center ${
            isCurrentViewYear
              ? "bg-blue-100 text-blue-800 border border-blue-300 cursor-default"
              : "border border-blue-600 text-blue-600 hover:bg-blue-50"
          }`}
        >
          Voir toute l&apos;année à venir
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Rechercher un mois précis :</span>
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        >
          <option value="">Mois</option>
          {months.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, "0")}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1.5 text-sm"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <Link
          href={
            monthFilter
              ? `/planning?month=${yearFilter}-${monthFilter}`
              : "/planning"
          }
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Voir ce mois
        </Link>
      </div>

      {!isOlderView && (
        <p className="text-sm">
          <Link
            href={`/planning?from=${oldestDate}&to=${threeMonthsAgoStr}`}
            className="text-blue-600 hover:underline"
          >
            Afficher les sessions antérieures à {threeMonthsAgoStr} (dépliant)
          </Link>
        </p>
      )}
      {isOlderView && (
        <p className="text-sm">
          <Link href="/planning" className="text-blue-600 hover:underline">
            ← Retour à la période récente
          </Link>
        </p>
      )}

      <p className="text-sm text-gray-500">
        Période affichée : du {filterFrom ?? threeMonthsAgoStr} au {filterTo ?? endOfCurrentMonthStr}.
        {filterMonth && ` (mois sélectionné)`}
      </p>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {showAddSession && canCreateSession && (
        <AddSessionForm
          onSubmit={handleCreateSession}
          onCancel={() => setShowAddSession(false)}
          disabled={busy}
        />
      )}

      {sessions.length === 0 ? (
        <p className="text-gray-600">
          Aucune session sur la période.{" "}
          {canCreateSession && "Cliquez sur « Nouvelle session » pour en créer une."}
        </p>
      ) : (
        <>
          <ul className="space-y-8">
          {(showAllSessions ? sessions : sessions.slice(0, VISIBLE_SESSIONS_INITIAL)).map((session) => {
            const slots = getSlots(session.start_time, session.end_time);
            const programType = session.program_type ?? "prière";
            const attendanceType = session.attendance_type ?? "presentiel";
            const location = session.location;
            return (
              <li
                key={session.id}
                className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {session.title || PROGRAM_TYPE_LABELS[programType] || "Session"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(session.session_date)} · {formatTime(session.start_time)} →{" "}
                      {formatTime(session.end_time)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        {PROGRAM_TYPE_LABELS[programType] || programType}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                        {ATTENDANCE_LABELS[attendanceType] || attendanceType}
                      </span>
                      {attendanceType === "presentiel" && location && (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-800 rounded">
                          {location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/planning/export/${session.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Exporter en PDF
                    </Link>
                    {canCreateSession && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                        disabled={busy}
                      >
                        Supprimer la session
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 pr-4 font-medium text-gray-700">
                          Créneau
                        </th>
                        <th className="text-left py-2 font-medium text-gray-700">
                          Inscriptions (max 3 par créneau)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slotTime) => {
                        const key = `${session.id}|${normalizeSlotTime(slotTime)}`;
                        const slotSignups = signupsBySessionSlot.get(key) ?? [];
                        const isAdding = addSignupFor?.sessionId === session.id && addSignupFor?.slotTime === slotTime;
                        return (
                          <tr key={slotTime} className="border-b border-gray-100">
                            <td className="py-2 pr-4 font-medium text-gray-800 whitespace-nowrap">
                              {formatTime(slotTime)}
                            </td>
                            <td className="py-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {slotSignups.map((su) => (
                                  <span
                                    key={su.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-800 rounded"
                                    title={churchNames[su.church_id] ? `${userDisplayNames[su.user_id] ?? su.user_id} · ${churchNames[su.church_id]}` : undefined}
                                  >
                                    {userDisplayNames[su.user_id] ?? su.user_id}
                                    {su.church_id && churchNames[su.church_id] && (
                                      <span className="text-muted-foreground text-xs">
                                        ({churchNames[su.church_id]})
                                      </span>
                                    )}
                                    {((currentUserId === su.added_by_user_id ||
                                      currentUserId === su.user_id) ||
                                      (isResponsableEglise &&
                                        userChurchId &&
                                        su.church_id === userChurchId)) && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSignup(su.id)}
                                        className="text-red-600 hover:underline text-xs"
                                        disabled={busy}
                                        title="Retirer"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </span>
                                ))}
                                {canAddSignup && !isAdding && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAddSignupFor({ sessionId: session.id, slotTime })
                                    }
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    + Ajouter
                                  </button>
                                )}
                                {isAdding && (
                                  <AddSignupForm
                                    sessionId={session.id}
                                    slotTime={slotTime}
                                    churchMembers={churchMembers}
                                    onSubmit={handleAddSignup}
                                    onCancel={() => setAddSignupFor(null)}
                                    disabled={busy}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </li>
            );
          })}
          </ul>
          {sessions.length > VISIBLE_SESSIONS_INITIAL && (
            <div className="mt-4">
              {showAllSessions ? (
                <button
                  type="button"
                  onClick={() => setShowAllSessions(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Replier (afficher seulement les {VISIBLE_SESSIONS_INITIAL} derniers)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAllSessions(true)}
                  className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium"
                >
                  Afficher les {sessions.length - VISIBLE_SESSIONS_INITIAL} autres programmes
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
