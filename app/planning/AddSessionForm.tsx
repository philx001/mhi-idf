"use client";

import { useState } from "react";
import type { PlanningProgramType, PlanningAttendanceType } from "@/types/database";

const PROGRAM_TYPES: { value: PlanningProgramType; label: string }[] = [
  { value: "prière", label: "Prière" },
  { value: "étude biblique", label: "Étude biblique" },
  { value: "culte", label: "Culte" },
  { value: "autre", label: "Autre" },
];

const ATTENDANCE_TYPES: { value: PlanningAttendanceType; label: string }[] = [
  { value: "presentiel", label: "En présentiel" },
  { value: "en_ligne", label: "En ligne" },
  { value: "autre", label: "Autre" },
];

type Props = {
  onSubmit: (input: {
    session_date: string;
    start_time: string;
    end_time: string;
    title?: string;
    program_type?: PlanningProgramType;
    attendance_type?: PlanningAttendanceType;
    location?: string;
  }) => Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
};

export function AddSessionForm({ onSubmit, onCancel, disabled }: Props) {
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  const [session_date, setSession_date] = useState(tomorrow);
  const [start_time, setStart_time] = useState("22:00");
  const [end_time, setEnd_time] = useState("06:00");
  const [title, setTitle] = useState("");
  const [program_type, setProgram_type] = useState<PlanningProgramType>("prière");
  const [attendance_type, setAttendance_type] = useState<PlanningAttendanceType>("presentiel");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      session_date,
      start_time: start_time.length === 5 ? start_time : start_time + ":00",
      end_time: end_time.length === 5 ? end_time : end_time + ":00",
      title: title.trim() || undefined,
      program_type,
      attendance_type,
      location: attendance_type === "presentiel" ? location.trim() || undefined : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4"
    >
      <h3 className="font-semibold text-gray-900">Nouvelle session</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="program_type" className="block text-sm font-medium text-gray-700 mb-1">
            Type de programme
          </label>
          <select
            id="program_type"
            value={program_type}
            onChange={(e) => setProgram_type(e.target.value as PlanningProgramType)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            {PROGRAM_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="attendance_type" className="block text-sm font-medium text-gray-700 mb-1">
            Type de présence
          </label>
          <select
            id="attendance_type"
            value={attendance_type}
            onChange={(e) => setAttendance_type(e.target.value as PlanningAttendanceType)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            {ATTENDANCE_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {attendance_type === "presentiel" && (
          <div className="sm:col-span-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Lieu
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ex. Salle principale, adresse..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        )}
        <div>
          <label htmlFor="session_date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="session_date"
            type="date"
            value={session_date}
            onChange={(e) => setSession_date(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre (optionnel)
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex. Nuit de prière"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
            Heure de début
          </label>
          <input
            id="start_time"
            type="time"
            value={start_time}
            onChange={(e) => setStart_time(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
            Heure de fin
          </label>
          <input
            id="end_time"
            type="time"
            value={end_time}
            onChange={(e) => setEnd_time(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Ex. 22h → 6h : saisir 22:00 et 06:00. Les créneaux sont générés par heure.
      </p>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          Créer la session
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
