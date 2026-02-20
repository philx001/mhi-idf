import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import {
  getDemandById,
  getProposalsByDemandId,
  getChurches,
  getUserChurchId,
  isSiege,
} from "@/lib/supabase/queries";
import { ProposalForm } from "./ProposalForm";

const DEMAND_TYPE_LABELS: Record<string, string> = {
  intervenant: "Intervenant",
  salle: "Salle",
  ressource: "Ressource",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DemandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUserWithTimeout(supabase);

  if (!user) {
    redirect("/login");
  }

  const [demand, proposals, churches, userChurchId, userIsSiege] =
    await Promise.all([
      getDemandById(id),
      getProposalsByDemandId(id),
      getChurches(true),
      getUserChurchId(),
      isSiege(),
    ]);

  if (!demand) {
    notFound();
  }

  const churchOptions = userIsSiege
    ? churches
    : churches.filter((c) => c.id === userChurchId);

  const canPropose =
    userChurchId && demand.church_id !== userChurchId && churchOptions.length > 0;

  const churchName =
    churches.find((c) => c.id === demand.church_id)?.name ?? "Église";

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/carte-des-besoins"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Carte des besoins
          </Link>
        </div>

        <article className="border border-gray-200 rounded-lg p-6 bg-white mb-6">
          <span className="inline-block text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded mb-2">
            {DEMAND_TYPE_LABELS[demand.type] ?? demand.type}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {demand.title}
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            {churchName} · {formatDate(demand.created_at)}
          </p>
          {demand.description && (
            <p className="text-gray-700 whitespace-pre-wrap">
              {demand.description}
            </p>
          )}
        </article>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Propositions ({proposals.length})
          </h2>

          {proposals.length === 0 ? (
            <p className="text-gray-500 text-sm mb-4">
              Aucune proposition pour le moment. Proposez une ressource si vous
              pouvez aider.
            </p>
          ) : (
            <ul className="space-y-3 mb-4">
              {proposals.map((p) => (
                <li
                  key={p.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <p className="font-medium text-gray-900">{p.church?.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(p.created_at)}
                  </p>
                  {p.description && (
                    <p className="text-gray-700 mt-2 text-sm">
                      {p.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {canPropose && (
            <ProposalForm
              demandId={id}
              churches={churchOptions}
              demandChurchId={demand.church_id}
            />
          )}
        </section>
      </div>
    </main>
  );
}
