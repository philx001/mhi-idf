import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserAndRole } from "@/lib/supabase/queries";
import { getNotifications } from "@/lib/supabase/queries";
import { NotificationsList } from "./NotificationsList";

export const dynamic = "force-dynamic";

const IMPORTANCE_LABELS: Record<string, string> = {
  info: "Info",
  normal: "Normal",
  important: "Important",
  urgente: "Urgent",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  const notifications = await getNotifications({ limit: 100 });
  const currentUserId = auth.user.id;
  const isSiege = auth.roleInfo.isSiege;
  const canEditMap = Object.fromEntries(
    notifications.map((n) => [n.id, n.created_by === currentUserId || isSiege])
  );

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Tableau de bord
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Notifications
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          4 niveaux : Info, Normal, Important, Urgent. Les notifications urgentes envoient un email à tous les responsables d&apos;églises. Seul l&apos;auteur ou le responsable siège peut modifier ou supprimer.
        </p>
        <NotificationsList
          notifications={notifications}
          canEditMap={canEditMap}
          importanceLabels={IMPORTANCE_LABELS}
        />
      </div>
    </main>
  );
}
