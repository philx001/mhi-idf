import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** La page Annonces du siège a été supprimée ; redirection vers le tableau de bord. */
export default function AnnoncesPage() {
  redirect("/dashboard");
}
