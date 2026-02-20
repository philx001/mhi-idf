"use client";

import Link from "next/link";
import type { EventWithChurch } from "@/types/database";

const EVENT_TYPE_LABELS: Record<string, string> = {
  culte: "Culte",
  etude_biblique: "Étude biblique",
  evenement: "Événement",
  autre: "Autre",
};

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatTime(timeStr: string | null): string {
  if (!timeStr) return "";
  const [h, m] = String(timeStr).split(":");
  return `${h}h${m ?? "00"}`;
}

interface ChurchCalendarProps {
  churchId: string;
  churchName: string;
  year: number;
  month: number;
  events: EventWithChurch[];
  canEdit: boolean;
}

export function ChurchCalendar({
  churchId,
  churchName,
  year,
  month,
  events,
  canEdit,
}: ChurchCalendarProps) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startPadding = (firstDay.getDay() + 6) % 7; // Lundi = 0
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {MONTHS[month - 1]} {year}
        </h2>
        <div className="flex gap-2">
          <Link
            href={`/churches/${churchId}/calendrier?year=${prevYear}&month=${prevMonth}`}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Mois précédent
          </Link>
          <Link
            href={`/churches/${churchId}/calendrier?year=${nextYear}&month=${nextMonth}`}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Mois suivant →
          </Link>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 border-b border-gray-200 bg-gray-50">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div
          className="grid grid-cols-7"
          style={{ gridTemplateRows: `repeat(${weeks}, minmax(80px, auto))` }}
        >
          {Array.from({ length: startPadding }, (_, i) => (
            <div key={`pad-${i}`} className="border-t border-gray-100 bg-gray-50/50 min-h-[80px]" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[dateStr] ?? [];
            return (
              <div
                key={dateStr}
                className="border-t border-l border-gray-100 p-1 min-h-[80px] flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{day}</span>
                  {canEdit && (
                    <Link
                      href={`/events/new?date=${dateStr}&church=${churchId}&returnTo=calendar`}
                      className="text-blue-600 hover:underline text-xs"
                      title="Ajouter un événement"
                    >
                      ＋
                    </Link>
                  )}
                </div>
                <ul className="mt-1 space-y-0.5 overflow-auto flex-1">
                  {dayEvents.map((ev) => {
                    const isShared = (ev as { visibility?: string }).visibility !== "private";
                    return (
                      <li key={ev.id}>
                        <Link
                          href={`/events/${ev.id}/edit`}
                          className={`block text-xs truncate rounded px-1 py-0.5 hover:opacity-90 ${
                            isShared
                              ? "bg-blue-50 text-blue-800 hover:bg-blue-100 border-l-2 border-blue-400"
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300 border-l-2 border-gray-500"
                          }`}
                          title={`${ev.title} · ${isShared ? "Partagé (réseau)" : "Privé (mon église)"} · ${EVENT_TYPE_LABELS[ev.type] ?? ev.type}${ev.event_time ? ` ${formatTime(ev.event_time)}` : ""}`}
                        >
                          {ev.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span className="font-medium text-gray-700">Calendriers :</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-blue-100 border-l-2 border-blue-400 inline-block" />
          Partagé (visible par tout le réseau)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-gray-200 border-l-2 border-gray-500 inline-block" />
          Privé (uniquement cette église)
        </span>
      </div>
      {canEdit && (
        <p className="text-sm text-gray-500">
          Cliquez sur ＋ un jour pour créer un événement (vous pourrez choisir Privé ou Partagé), ou{" "}
          <Link
            href={`/events/new?church=${churchId}&returnTo=calendar`}
            className="text-blue-600 hover:underline"
          >
            nouvel événement
          </Link>
          .
        </p>
      )}
    </div>
  );
}
