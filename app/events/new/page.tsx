import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getChurches, getUserAndRole } from "@/lib/supabase/queries";
import { EventForm } from "../EventForm";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; church?: string; returnTo?: string }>;
}) {
  const { date: defaultDate, church: churchIdParam, returnTo } = await searchParams;
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  const { roleInfo } = auth;
  const churches = await getChurches(true);

  const canCreate = roleInfo.isSiege || roleInfo.isResponsableEglise;
  if (!canCreate) {
    redirect("/dashboard");
  }

  let churchOptions = roleInfo.isSiege
    ? churches
    : roleInfo.churchId
    ? churches.filter((c) => c.id === roleInfo.churchId)
    : [];

  const returnToCalendarChurchId =
    returnTo === "calendar" && churchIdParam ? churchIdParam : null;
  if (returnToCalendarChurchId && churchOptions.every((c) => c.id !== returnToCalendarChurchId)) {
    churchOptions = churchOptions.length ? churchOptions : churches.filter((c) => c.id === returnToCalendarChurchId);
  }

  if (churchOptions.length === 0) {
    redirect("/dashboard");
  }

  const backHref = returnToCalendarChurchId
    ? `/churches/${returnToCalendarChurchId}/calendrier`
    : "/dashboard";

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link href={backHref} className="text-blue-600 hover:underline text-sm">
            ← {returnToCalendarChurchId ? "Calendrier" : "Tableau de bord"}
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Nouvel événement
        </h1>
        <EventForm
          churches={churchOptions}
          defaultDate={defaultDate ?? undefined}
          returnToCalendarChurchId={returnToCalendarChurchId}
        />
      </div>
    </main>
  );
}
