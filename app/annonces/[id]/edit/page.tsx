import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import { getAnnouncementById, isSiege } from "@/lib/supabase/queries";
import { AnnouncementForm } from "../../AnnouncementForm";

export default async function EditAnnoncePage({
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

  if (!userIsSiege) {
    redirect("/annonces");
  }

  if (!announcement) {
    notFound();
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/annonces/${id}`}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Retour à l&apos;annonce
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Modifier l&apos;annonce
        </h1>
        <AnnouncementForm announcement={announcement} />
      </div>
    </main>
  );
}
