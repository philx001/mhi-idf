import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import { canEditEvent, getEventById, getChurches, getUserChurchId, isSiege } from "@/lib/supabase/queries";
import { EventForm } from "../../EventForm";

export default async function EditEventPage({
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

  const [event, userCanEdit, churches, userChurchId, userIsSiege] =
    await Promise.all([
      getEventById(id),
      canEditEvent(id),
      getChurches(true),
      getUserChurchId(),
      isSiege(),
    ]);

  if (!event) {
    notFound();
  }

  if (!userCanEdit) {
    redirect("/dashboard");
  }

  const churchOptions = userIsSiege
    ? churches
    : churches.filter((c) => c.id === userChurchId);

  return (
    <main className="min-h-screen p-4 sm:p-8 pb-16">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Tableau de bord
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Modifier l&apos;événement
        </h1>
        <EventForm
          churches={churchOptions}
          event={event}
          userIsSiege={userIsSiege ?? false}
        />
      </div>
    </main>
  );
}
