import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDemandById, getChurches, canEditDemand, getUserChurchId, isSiege } from "@/lib/supabase/queries";
import { DemandForm } from "../../DemandForm";

export default async function EditDemandePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    redirect("/login");
  }

  const [demand, userCanEdit, churches, userChurchId, userIsSiege] =
    await Promise.all([
      getDemandById(id),
      canEditDemand(id),
      getChurches(true),
      getUserChurchId(),
      isSiege(),
    ]);

  if (!demand) {
    notFound();
  }

  if (!userCanEdit) {
    redirect("/carte-des-besoins");
  }

  const churchOptions = userIsSiege
    ? churches
    : userChurchId
    ? churches.filter((c) => c.id === userChurchId)
    : [];

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/carte-des-besoins/${id}`}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Retour à la demande
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Modifier la demande
        </h1>
        <DemandForm churches={churchOptions} demand={demand} />
      </div>
    </main>
  );
}
