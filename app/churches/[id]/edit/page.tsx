import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import { canEditChurch, getChurchById, isSiege } from "@/lib/supabase/queries";
import { ChurchForm } from "../../ChurchForm";
import { ChurchActions } from "@/components/ChurchActions";

export default async function EditChurchPage({
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

  const [userCanEdit, church, userIsSiege] = await Promise.all([
    canEditChurch(id),
    getChurchById(id),
    isSiege(),
  ]);

  if (!userCanEdit) {
    redirect("/churches");
  }

  if (!church) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <Link href="/churches" className="text-blue-600 hover:underline">
            ← Retour à la liste
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Modifier {church.name}
        </h1>
        <ChurchForm church={church} canToggleActive={userIsSiege} />
        <ChurchActions
          churchId={church.id}
          churchName={church.name}
          canDeactivate={userIsSiege}
          isActive={church.is_active}
        />
      </div>
    </main>
  );
}
