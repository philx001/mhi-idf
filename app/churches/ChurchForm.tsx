"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Church } from "@/types/database";

interface ChurchFormProps {
  church?: Church;
  canToggleActive?: boolean;
}

export function ChurchForm({ church, canToggleActive = false }: ChurchFormProps) {
  const [name, setName] = useState(church?.name ?? "");
  const [description, setDescription] = useState(church?.description ?? "");
  const [email, setEmail] = useState(
    (church?.contacts as Record<string, string> | undefined)?.email ?? ""
  );
  const [phone, setPhone] = useState(
    (church?.contacts as Record<string, string> | undefined)?.phone ?? ""
  );
  const [address, setAddress] = useState(
    (church?.contacts as Record<string, string> | undefined)?.address ?? ""
  );
  const [specialities, setSpecialities] = useState(
    church?.specialities?.join(", ") ?? ""
  );
  const [isActive, setIsActive] = useState(church?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const specialitiesList = specialities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const contacts: Record<string, string> = {};
    if (email.trim()) contacts.email = email.trim();
    if (phone.trim()) contacts.phone = phone.trim();
    if (address.trim()) contacts.address = address.trim();

    try {
      if (church) {
        const updateData: Record<string, unknown> = {
          name,
          description: description || null,
          contacts,
          specialities: specialitiesList,
          updated_at: new Date().toISOString(),
        };
        if (canToggleActive) {
          updateData.is_active = isActive;
        }
        const { error: updateError } = await supabase
          .from("churches")
          .update(updateData)
          .eq("id", church.id);

        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("churches")
          .insert({
            name,
            description: description || null,
            contacts,
            specialities: specialitiesList,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        // Créer le dossier documents pour cette église (placeholder)
        if (inserted?.id) {
          try {
            await supabase.storage
              .from("documents")
              .upload(`${inserted.id}/.keep`, new Blob([""]), { upsert: true });
          } catch {
            // Bucket peut ne pas exister encore ; ignoré
          }
        }
      }

      router.push("/churches");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nom *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Église MHI Paris Centre"
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
          placeholder="Présentation de l&apos;église..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="contact@eglise.org"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Téléphone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="01 23 45 67 89"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Adresse
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="123 rue Example, 75001 Paris"
        />
      </div>

      <div>
        <label
          htmlFor="specialities"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Spécialités
        </label>
        <input
          id="specialities"
          type="text"
          value={specialities}
          onChange={(e) => setSpecialities(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Jeunesse, Louange, Accueil (séparées par des virgules)"
        />
      </div>

      {church && canToggleActive && (
        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Profil actif (désactiver pour masquer de la liste)
          </label>
        </div>
      )}

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
        {loading ? "Enregistrement..." : church ? "Enregistrer" : "Créer"}
      </button>
    </form>
  );
}
