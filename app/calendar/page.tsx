import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSharedEventsForSynthetic, getChurches, getUserAndRole } from "@/lib/supabase/queries";
import { EventActions } from "@/components/EventActions";
import { CalendarFilter } from "./CalendarFilter";
import { SetEventMainButton } from "./SetEventMainButton";
import { SyntheticCalendarGrid } from "./SyntheticCalendarGrid";
import { getChurchColorStyle } from "@/lib/calendarColors";

const EVENT_TYPE_LABELS: Record<string, string> = {
  culte: "Culte",
  etude_biblique: "Étude biblique",
  evenement: "Événement",
  autre: "Autre",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "";
  const [h, m] = String(timeStr).split(":");
  return `${h}h${m ?? "00"}`;
}

/** Périodes de 7 jours sans aucun événement partagé (creux) */
function getEmptyPeriods(
  fromStr: string,
  toStr: string,
  eventDates: Set<string>
): { start: string; end: string }[] {
  const periods: { start: string; end: string }[] = [];
  const from = new Date(fromStr);
  const to = new Date(toStr);
  let current = new Date(from);
  let periodStart: string | null = null;

  while (current <= to) {
    const d = current.toISOString().split("T")[0];
    if (!eventDates.has(d)) {
      if (!periodStart) periodStart = d;
    } else {
      if (periodStart) {
        const end = new Date(current);
        end.setDate(end.getDate() - 1);
        periods.push({ start: periodStart, end: end.toISOString().split("T")[0] });
        periodStart = null;
      }
    }
    current.setDate(current.getDate() + 1);
  }
  if (periodStart) {
    periods.push({ start: periodStart, end: toStr });
  }
  return periods.filter((p) => {
    const start = new Date(p.start);
    const end = new Date(p.end);
    return (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000) >= 6;
  });
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ church?: string; year?: string; month?: string }>;
}) {
  const { church: churchId, year: yearParam, month: monthParam } = await searchParams;
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  const now = new Date();
  const { roleInfo } = auth;
  const userIsSiege = roleInfo.isSiege;
  const userChurchId = roleInfo.churchId;
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;
  const safeYear = Number.isNaN(year) ? now.getFullYear() : year;
  const safeMonth = Math.max(1, Math.min(12, Number.isNaN(month) ? now.getMonth() + 1 : month));
  const fromStr = `${safeYear}-01-01`;
  const toStr = `${safeYear}-12-31`;

  const [eventsData, churches] = await Promise.all([
    getSharedEventsForSynthetic(fromStr, toStr),
    getChurches(true),
  ]);

  let events = churchId
    ? eventsData.filter((e) => e.church_id === churchId)
    : eventsData;

  const monthStart = `${safeYear}-${String(safeMonth).padStart(2, "0")}-01`;
  const monthEndDay = new Date(safeYear, safeMonth, 0).getDate();
  const monthEnd = `${safeYear}-${String(safeMonth).padStart(2, "0")}-${String(monthEndDay).padStart(2, "0")}`;
  const eventsForGrid = events.filter(
    (e) => e.event_date >= monthStart && e.event_date <= monthEnd
  );

  const eventDates = new Set(events.map((e) => e.event_date));
  const emptyPeriods = getEmptyPeriods(fromStr, toStr, eventDates);
  const mainEvents = events.filter((e) => e.is_main);
  const dateToChurchIds = events.reduce<Record<string, Set<string>>>((acc, e) => {
    const d = e.event_date;
    if (!acc[d]) acc[d] = new Set();
    acc[d].add(e.church_id);
    return acc;
  }, {});
  const commonDates = Object.entries(dateToChurchIds)
    .filter(([, ids]) => ids.size >= 2)
    .map(([date]) => date)
    .sort();

  const canEditMap = Object.fromEntries(
    events.map((e) => [
      e.id,
      userIsSiege || (roleInfo.isResponsableEglise && userChurchId === e.church_id),
    ])
  );

  const churchNamesById = eventsData.reduce<Record<string, string>>((acc, e) => {
    if (e.church?.name && !acc[e.church_id]) acc[e.church_id] = e.church.name;
    return acc;
  }, {});
  const uniqueChurchIds = [...new Set(eventsData.map((e) => e.church_id))].filter(Boolean).sort((a, b) => (churchNamesById[a] ?? "").localeCompare(churchNamesById[b] ?? ""));

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Tableau de bord
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Calendrier synthétique du réseau
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/calendar?year=${safeYear - 1}&month=${safeMonth}${churchId ? `&church=${churchId}` : ""}`}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← {safeYear - 1}
            </Link>
            <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
              {safeYear}
            </span>
            <Link
              href={`/calendar?year=${safeYear + 1}&month=${safeMonth}${churchId ? `&church=${churchId}` : ""}`}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {safeYear + 1} →
            </Link>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Programmes partagés par les églises, programmes principaux et dates en commun.
          {userIsSiege && " En tant que responsable siège, vous pouvez marquer des événements comme « programme principal »."}
        </p>

        <Suspense fallback={<div className="mb-4 h-10 animate-pulse bg-gray-200 rounded" />}>
          <CalendarFilter
            churches={churches}
            selectedChurchId={churchId}
            selectedYear={safeYear}
            selectedMonth={safeMonth}
          />
        </Suspense>

        <div className="mb-4 flex flex-wrap gap-2">
          {(userIsSiege || roleInfo.isResponsableEglise) && (
            <Link
              href="/events/new"
              className="text-green-600 hover:underline text-sm"
            >
              + Créer un événement
            </Link>
          )}
          {userChurchId && (
            <Link
              href={`/churches/${userChurchId}/calendrier`}
              className="text-blue-600 hover:underline text-sm"
            >
              Mon calendrier d&apos;église
            </Link>
          )}
        </div>

        <section className="mb-8">
          <SyntheticCalendarGrid
            year={safeYear}
            month={safeMonth}
            events={eventsForGrid}
            churchId={churchId}
            canEditMap={canEditMap}
          />
          {uniqueChurchIds.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500 font-medium">Églises :</span>
              {uniqueChurchIds.map((cid) => (
                <span
                  key={cid}
                  className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
                  style={getChurchColorStyle(cid)}
                >
                  {churchNamesById[cid] ?? cid}
                </span>
              ))}
            </div>
          )}
        </section>

        {mainEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Programmes principaux
            </h2>
            <ul className="space-y-3">
              {mainEvents.map((event) => (
                <li
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(event.event_date)}
                        {event.event_time && ` · ${formatTime(event.event_time)}`}
                        {event.church && (
                          <>
                            {" · "}
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-xs font-medium"
                              style={getChurchColorStyle(event.church_id)}
                            >
                              {event.church.name}
                            </span>
                          </>
                        )}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                      )}
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded">
                        {EVENT_TYPE_LABELS[event.type] ?? event.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {userIsSiege && (
                        <SetEventMainButton
                          eventId={event.id}
                          isMain={true}
                        />
                      )}
                      <EventActions
                        eventId={event.id}
                        canEdit={canEditMap[event.id] ?? false}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {commonDates.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Dates en commun (plusieurs églises)
            </h2>
            <ul className="text-sm text-gray-700 space-y-1">
              {commonDates.slice(0, 20).map((d) => (
                <li key={d}>
                  {formatDate(d)} — {dateToChurchIds[d].size} église(s)
                </li>
              ))}
              {commonDates.length > 20 && (
                <li className="text-gray-500">… et {commonDates.length - 20} autre(s) date(s)</li>
              )}
            </ul>
          </section>
        )}

        {emptyPeriods.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Périodes creuses (sans événement partagé)
            </h2>
            <ul className="text-sm text-gray-600 space-y-1">
              {emptyPeriods.slice(0, 15).map((p) => (
                <li key={p.start}>
                  {formatDate(p.start)} → {formatDate(p.end)}
                </li>
              ))}
              {emptyPeriods.length > 15 && (
                <li className="text-gray-500">… et {emptyPeriods.length - 15} autre(s) période(s)</li>
              )}
            </ul>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Tous les événements partagés
          </h2>
          {events.length === 0 ? (
            <p className="text-gray-600">
              Aucun événement partagé sur cette période. Les événements marqués « Partagé » par les églises apparaîtront ici.
            </p>
          ) : (
            <ul className="space-y-4">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(event.event_date)}
                        {event.event_time && ` · ${formatTime(event.event_time)}`}
                      </p>
                      {event.church && (
                        <p className="text-sm mt-1">
                          <span
                            className="inline-block text-xs px-2 py-0.5 rounded font-medium"
                            style={getChurchColorStyle(event.church_id)}
                          >
                            {event.church.name}
                          </span>
                        </p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded">
                          {EVENT_TYPE_LABELS[event.type] ?? event.type}
                        </span>
                        {event.is_main && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {userIsSiege && (
                        <SetEventMainButton
                          eventId={event.id}
                          isMain={event.is_main}
                        />
                      )}
                      <EventActions
                        eventId={event.id}
                        canEdit={canEditMap[event.id] ?? false}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
