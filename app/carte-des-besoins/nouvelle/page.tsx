import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getChurches, getUserAndRole } from "@/lib/supabase/queries";
import { DemandForm } from "../DemandForm";

export default async function NouvelleDemandePage() {
  const supabase = await createClient();
  const auth = await getUserAndRole(supabase);

  if (!auth) {
    redirect("/login");
  }

  const canCreate = auth.roleInfo.isSiege || auth.roleInfo.isResponsableEglise;
  if (!canCreate) {
    redirect("/carte-des-besoins");
  }

  const churches = await getChurches(true);
  const churchOptions = auth.roleInfo.isSiege
    ? churches
    : auth.roleInfo.churchId
    ? churches.filter((c) => c.id === auth.roleInfo.churchId)
    : [];

  if (churchOptions.length === 0) {
    redirect("/carte-des-besoins");
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link
            href="/carte-des-besoins"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Carte des besoins
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Nouvelle demande
        </h1>
        <DemandForm churches={churchOptions} />
      </div>
    </main>
  );
}
