"use client";

import Link from "next/link";
import type { EventWithChurch } from "@/types/database";
import { getChurchColorStyle } from "@/lib/calendarColors";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  culte: "Culte",
  etude_biblique: "Étude biblique",
  evenement: "Événement",
  conference_semaine_royale: "Conférence Semaine Royale",
  camp: "Camp",
  retraite_priere: "Retraite de Prière",
  conference_thematique: "Conférence Thématique",
  autre: "Autre",
};

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = String(timeStr).split(":");
  return `${h}h${m ?? "00"}`;
}

interface SyntheticCalendarGridProps {
  year: number;
  month: number;
  events: EventWithChurch[];
  churchId?: string;
  canEditMap: Record<string, boolean>;
}

export function SyntheticCalendarGrid({
  year,
  month,
  events,
  churchId,
  canEditMap,
}: SyntheticCalendarGridProps) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startPadding = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const totalCells = startPadding + daysInMonth;
  const weeks = Math.ceil(totalCells / 7);

  const eventsByDate: Record<string, EventWithChurch[]> = {};
  events.forEach((e) => {
    const d = e.event_date;
    if (!eventsByDate[d]) eventsByDate[d] = [];
    eventsByDate[d].push(e);
  });

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const baseParams = new URLSearchParams();
  if (churchId) baseParams.set("church", churchId);
  baseParams.set("year", String(year));
  const prevUrl = `/calendar?year=${prevYear}&month=${prevMonth}${churchId ? `&church=${churchId}` : ""}`;
  const nextUrl = `/calendar?year=${nextYear}&month=${nextMonth}${churchId ? `&church=${churchId}` : ""}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold text-gray-900">
          {MONTHS[month - 1]} {year}
        </h2>
        <div className="flex gap-2">
          <Link
            href={prevUrl}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Mois précédent
          </Link>
          <Link
            href={nextUrl}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Mois suivant →
          </Link>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 border-b border-gray-200 bg-gray-50">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div
          className="grid grid-cols-7"
          style={{ gridTemplateRows: `repeat(${weeks}, minmax(96px, auto))` }}
        >
          {Array.from({ length: startPadding }, (_, i) => (
            <div key={`pad-${i}`} className="border-t border-gray-100 bg-gray-50/50 min-h-[96px]" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[dateStr] ?? [];
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() + 1 === month &&
              new Date().getDate() === day;
            return (
              <div
                key={dateStr}
                className={`border-t border-l border-gray-100 p-1.5 min-h-[96px] flex flex-col ${
                  isToday ? "bg-blue-50/50" : ""
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isToday ? "text-blue-700 bg-blue-100 rounded-full w-7 h-7 flex items-center justify-center" : "text-gray-700"
                  }`}
                >
                  {day}
                </span>
                <ul className="mt-1 space-y-0.5 overflow-auto flex-1">
                  {dayEvents.map((ev) => (
                    <li key={ev.id}>
                      <a
                        href={`#event-${ev.id}`}
                        className="block text-xs truncate rounded px-1 py-0.5 hover:opacity-90"
                        style={getChurchColorStyle(ev.church_id)}
                        title={`${ev.title} · ${ev.church?.name ?? ""} · ${ev.type === "autre" && ev.type_other ? ev.type_other : (EVENT_TYPE_LABELS[ev.type] ?? ev.type)}${ev.event_time ? ` ${formatTime(ev.event_time)}` : ""}`}
                      >
                        {ev.is_main ? "★ " : ""}{ev.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
