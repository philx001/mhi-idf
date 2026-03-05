import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/supabase/queries";
import { getDemands } from "@/lib/supabase/queries";
import { DemandFilter } from "./DemandFilter";

const DEMAND_TYPE_LABELS: Record<string, string> = {
  intervenant: "Intervenant",
  salle: "Salle",
  ressource: "Ressources Diverses",
  financier: "Financier",
  conseil: "Conseil",
  aide_logistique: "Aide Logistique",
  ressources_spirituelles: "Ressources Spirituelles",
  autre: "Autre",
};

const DEMAND_IMPORTANCE_LABELS: Record<string, string> = {
  faible: "Faible",
  moyen: "Moyen",
  eleve: "Élevé",
  urgent: "Urgent",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CarteDesBesoinsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  const canCreateDemand = auth.roleInfo.isSiege || auth.roleInfo.isResponsableEglise;
  const demands = await getDemands(type);

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Tableau de bord
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Carte des besoins
        </h1>

        <Suspense
          fallback={
            <div className="mb-6 h-10 animate-pulse bg-gray-200 rounded" />
          }
        >
          <DemandFilter selectedType={type} />
        </Suspense>

        {canCreateDemand && (
          <div className="mb-4">
            <Link
              href="/carte-des-besoins/nouvelle"
              className="text-green-600 hover:underline text-sm"
            >
              + Créer une demande
            </Link>
          </div>
        )}

        {demands.length === 0 ? (
          <p className="text-gray-600">
            {canCreateDemand
              ? "Aucune demande pour le moment. Créez une demande pour que les autres églises puissent proposer une solution."
              : "Aucune demande pour le moment."}
          </p>
        ) : (
          <ul className="space-y-4">
            {demands.map((demand) => (
              <li
                key={demand.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <Link href={`/carte-des-besoins/${demand.id}`} className="block">
                  <p className="font-medium text-gray-900 hover:text-blue-600 hover:underline">
                    {demand.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {demand.church?.name} · {formatDate(demand.created_at)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(demand.types ?? []).map((t) => (
                      <span
                        key={t}
                        className="inline-block text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded"
                      >
                        {DEMAND_TYPE_LABELS[t] ?? t}
                      </span>
                    ))}
                    {demand.importance && (
                      <span className="inline-block text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {DEMAND_IMPORTANCE_LABELS[demand.importance] ?? demand.importance}
                      </span>
                    )}
                  </div>
                  {demand.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {demand.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
