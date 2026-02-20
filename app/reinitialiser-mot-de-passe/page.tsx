import Link from "next/link";
import { MhiLogo } from "@/components/MhiLogo";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ReinitialiserMotDePassePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-background via-background to-muted/30">
      <MhiLogo href="/" size="home" className="mb-6" />
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Définir un nouveau mot de passe
      </h1>
      <p className="text-muted-foreground text-sm text-center max-w-md mb-6">
        Vous êtes arrivé ici via le lien envoyé par email. Saisissez votre
        nouveau mot de passe ci-dessous.
      </p>
      <ResetPasswordForm />
      <p className="mt-6 text-center">
        <Link href="/login" className="text-primary hover:underline text-sm">
          ← Retour à la connexion
        </Link>
      </p>
    </main>
  );
}
