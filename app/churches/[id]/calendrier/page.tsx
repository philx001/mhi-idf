import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getChurchById, getUserAndRole } from "@/lib/supabase/queries";
import { getEventsForChurchCalendar } from "@/lib/supabase/queries";
import { ChurchCalendar } from "./ChurchCalendar";

export default async function ChurchCalendrierPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { id: churchId } = await params;
  const { year: yearParam, month: monthParam } = await searchParams;
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  const church = await getChurchById(churchId);
  if (!church || !church.is_active) {
    notFound();
  }

  const { roleInfo } = auth;
  const userIsSiege = roleInfo.isSiege;
  const userChurchId = roleInfo.churchId;
  const isMemberOfChurch = userChurchId === churchId;
  const canAccess = userIsSiege || isMemberOfChurch;
  const canEdit = userIsSiege || (roleInfo.isResponsableEglise && isMemberOfChurch);

  if (!canAccess) {
    redirect("/churches");
  }

  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;
  const safeYear = Number.isNaN(year) ? now.getFullYear() : year;
  const safeMonth = Math.max(1, Math.min(12, Number.isNaN(month) ? now.getMonth() + 1 : month));

  const fromDate = `${safeYear}-${String(safeMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(safeYear, safeMonth, 0).getDate();
  const toDate = `${safeYear}-${String(safeMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const events = await getEventsForChurchCalendar(churchId, fromDate, toDate);

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href={`/churches/${churchId}`}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Profil de l&apos;église
          </Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            Tableau de bord
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Calendrier · {church.name}
        </h1>
        <p className="text-gray-600 text-sm mb-2">
          {churchId === userChurchId
            ? "Votre calendrier regroupe deux types d’événements : les événements privés (visibles uniquement par votre église) et les événements partagés (visibles par tout le réseau sur le calendrier synthétique). Lors de la création ou modification d’un événement, vous choisissez « Privé » ou « Partagé »."
            : "Calendrier de cette église (visible car vous êtes responsable siège). Les événements peuvent être privés (uniquement cette église) ou partagés (réseau)."}
        </p>
        <p className="text-gray-500 text-xs mb-6">
          En créant ou modifiant un événement, le champ « Calendrier : Privé ou Partagé » permet de le rattacher à l’un ou l’autre.
        </p>

        <ChurchCalendar
          churchId={churchId}
          churchName={church.name}
          year={safeYear}
          month={safeMonth}
          events={events}
          canEdit={canEdit}
        />
      </div>
    </main>
  );
}
