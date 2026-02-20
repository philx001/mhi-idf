import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import { isSiege } from "@/lib/supabase/queries";
import { AnnouncementForm } from "../AnnouncementForm";

export default async function NouvelleAnnoncePage() {
  const supabase = await createClient();
  const user = await getUserWithTimeout(supabase);

  if (!user) {
    redirect("/login");
  }

  const userIsSiege = await isSiege(supabase);
  if (!userIsSiege) {
    redirect("/annonces");
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link
            href="/annonces"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Annonces
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Nouvelle annonce
        </h1>
        <AnnouncementForm />
      </div>
    </main>
  );
}
