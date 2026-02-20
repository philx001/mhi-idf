"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DateInput } from "@/components/DateInput";
import { TimeInput } from "@/components/TimeInput";
import type { Church, Event, EventVisibility } from "@/types/database";
import type { EventType } from "@/types/database";

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "culte", label: "Culte" },
  { value: "etude_biblique", label: "Étude biblique" },
  { value: "evenement", label: "Événement" },
  { value: "autre", label: "Autre" },
];

const VISIBILITY_OPTIONS: { value: EventVisibility; label: string }[] = [
  { value: "private", label: "Privé (uniquement mon église)" },
  { value: "shared", label: "Partagé (visible par tout le réseau)" },
];

interface EventFormProps {
  churches: Church[];
  event?: Event;
  /** Siège peut marquer l'événement comme « principal » pour le calendrier synthétique */
  userIsSiege?: boolean;
  /** Rediriger vers le calendrier de l'église après création */
  returnToCalendarChurchId?: string | null;
  /** Date préremplie (création depuis le calendrier) */
  defaultDate?: string;
}

export function EventForm({
  churches,
  event,
  userIsSiege = false,
  returnToCalendarChurchId = null,
  defaultDate,
}: EventFormProps) {
  const [churchId, setChurchId] = useState(
    event?.church_id ?? returnToCalendarChurchId ?? churches[0]?.id ?? ""
  );
  const [title, setTitle] = useState(event?.title ?? "");
  const [type, setType] = useState<EventType>(event?.type ?? "evenement");
  const [eventDate, setEventDate] = useState(
    event?.event_date ?? defaultDate ?? ""
  );
  const [eventTime, setEventTime] = useState(
    event?.event_time ? String(event.event_time).slice(0, 5) : ""
  );
  const [location, setLocation] = useState(event?.location ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [visibility, setVisibility] = useState<EventVisibility>(
    event?.visibility ?? "shared"
  );
  const [isMain, setIsMain] = useState(event?.is_main ?? false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const payload = {
      church_id: churchId,
      title,
      type,
      event_date: eventDate,
      event_time: eventTime || null,
      location: location || null,
      description: description || null,
      visibility,
      ...(event && userIsSiege && visibility === "shared"
        ? { is_main: isMain }
        : {}),
      updated_at: new Date().toISOString(),
    };

    const { error: submitError } = event
      ? await supabase.from("events").update(payload).eq("id", event.id)
      : await supabase.from("events").insert(payload);

    setLoading(false);

    if (submitError) {
      setError(submitError.message);
      return;
    }

    if (!event && returnToCalendarChurchId) {
      router.push(`/churches/${returnToCalendarChurchId}/calendrier`);
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="church"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Église *
        </label>
        <select
          id="church"
          value={churchId}
          onChange={(e) => setChurchId(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {churches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Titre *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Culte du dimanche"
        />
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Type *
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as EventType)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4">
        <span className="block text-sm font-semibold text-gray-800 mb-1">
          Calendrier : Privé ou Partagé *
        </span>
        <p className="text-xs text-gray-600 mb-3">
          Choisissez dans quel calendrier apparaît cet événement. <strong>Privé</strong> : visible uniquement par les membres de votre église. <strong>Partagé</strong> : visible par tout le réseau sur le calendrier synthétique.
        </p>
        <div className="flex flex-wrap gap-4">
          {VISIBILITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 cursor-pointer rounded-lg border-2 px-4 py-2 transition ${
                visibility === opt.value
                  ? "border-blue-600 bg-white shadow-sm"
                  : "border-gray-200 bg-white/80 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-800">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {event && userIsSiege && visibility === "shared" && (
        <div className="flex items-center gap-2">
          <input
            id="is_main"
            type="checkbox"
            checked={isMain}
            onChange={(e) => setIsMain(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="is_main" className="text-sm text-gray-700">
            Programme principal (affiché en évidence sur le calendrier synthétique)
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="eventDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date *
          </label>
          <DateInput
            id="eventDate"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            min={today}
          />
        </div>
        <div>
          <label
            htmlFor="eventTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Heure
          </label>
          <TimeInput
            id="eventTime"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Lieu
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Salle principale"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Détails de l'événement..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Enregistrement..." : event ? "Enregistrer" : "Créer l'événement"}
      </button>
    </form>
  );
}
