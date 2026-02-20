import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWithTimeout } from "@/lib/supabase/auth";
import { isSiege } from "@/lib/supabase/queries";
import { ChurchForm } from "../ChurchForm";

export default async function NewChurchPage() {
  const supabase = await createClient();
  const user = await getUserWithTimeout(supabase);

  if (!user) {
    redirect("/login");
  }

  const userIsSiege = await isSiege();
  if (!userIsSiege) {
    redirect("/churches");
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
          Nouvelle église
        </h1>
        <ChurchForm />
      </div>
    </main>
  );
}
