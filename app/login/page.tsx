import { LoginForm } from "./LoginForm";
import { MhiLogo } from "@/components/MhiLogo";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-background to-muted/30">
      <MhiLogo href="/" size="home" className="mb-6" />
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Connexion
      </h1>
      <LoginForm />
    </main>
  );
}
