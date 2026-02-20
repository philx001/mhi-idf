import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import { getAnnouncementById, isSiege } from "@/lib/supabase/queries";
import { AnnouncementActions } from "./AnnouncementActions";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AnnonceDetailPage({
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

  const [announcement, userIsSiege] = await Promise.all([
    getAnnouncementById(id),
    isSiege(),
  ]);

  if (!announcement) {
    notFound();
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/annonces" className="text-blue-600 hover:underline text-sm">
            ← Annonces
          </Link>
          {userIsSiege && (
            <AnnouncementActions announcementId={id} />
          )}
        </div>

        <article className="border border-gray-200 rounded-lg p-6 bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {announcement.title}
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            {formatDate(announcement.created_at)}
          </p>
          {announcement.content && (
            <div className="text-gray-700 whitespace-pre-wrap">
              {announcement.content}
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
