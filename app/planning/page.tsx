import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/supabase/queries";
import { getPlanningPageData } from "./actions";
import { PlanningContent } from "./PlanningContent";

export const dynamic = "force-dynamic";

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; month?: string }>;
}) {
  let auth;
  try {
    const supabase = await createClient();
    auth = await getUserAndRole(supabase);
  } catch {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600 bg-red-50 p-4 rounded-lg">
            Impossible de vérifier la session. Vérifiez la connexion Supabase (.env.local).
          </p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Tableau de bord
          </Link>
        </div>
      </main>
    );
  }

  if (!auth) {
    redirect("/login");
  }

  const { from, to, month } = await searchParams;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsAgoStr = threeMonthsAgo.toISOString().split("T")[0];
  const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const endOfCurrentMonthStr = endOfCurrentMonth.toISOString().split("T")[0];
  const twelveMonthsLater = new Date(today);
  twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
  const twelveMonthsLaterStr = twelveMonthsLater.toISOString().split("T")[0];

  let rangeFrom: string;
  let rangeTo: string;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    rangeFrom = `${month}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    rangeTo = `${month}-${String(lastDay).padStart(2, "0")}`;
  } else if (from && to) {
    rangeFrom = from;
    rangeTo = to;
  } else {
    rangeFrom = threeMonthsAgoStr;
    rangeTo = endOfCurrentMonthStr;
  }

  let data;
  try {
    data = await getPlanningPageData({ from: rangeFrom, to: rangeTo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    const hint = String(message).includes("prayer")
      ? " Assurez-vous d’avoir exécuté la migration 012_prayer_planning.sql dans Supabase."
      : "";
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600 bg-red-50 p-4 rounded-lg">
            Erreur serveur : {message}.{hint}
          </p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Tableau de bord
          </Link>
        </div>
      </main>
    );
  }

  if (data.error && data.error !== "Non authentifié") {
    return (
      <main className="min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600 bg-red-50 p-4 rounded-lg">{data.error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Tableau de bord
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Tableau de bord
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Planning partagé
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Sessions (prière, culte, étude biblique…) : chaque créneau peut accueillir jusqu’à 3 membres maximum.
        </p>
        <PlanningContent
          sessions={data.sessions}
          signups={data.signups}
          userDisplayNames={data.userDisplayNames}
          churchNames={data.churchNames}
          canCreateSession={data.canCreateSession}
          canAddSignup={data.canAddSignup}
          churchMembers={data.churchMembers}
          currentUserId={data.currentUserId}
          userChurchId={data.userChurchId}
          isResponsableEglise={data.isResponsableEglise}
          filterFrom={rangeFrom}
          filterTo={rangeTo}
          filterMonth={month}
          threeMonthsAgoStr={threeMonthsAgoStr}
          todayStr={todayStr}
          endOfCurrentMonthStr={endOfCurrentMonthStr}
          twelveMonthsLaterStr={twelveMonthsLaterStr}
        />
      </div>
    </main>
  );
}
