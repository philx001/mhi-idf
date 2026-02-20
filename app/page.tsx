import { HomeClient } from "./HomeClient";
import { MhiLogo } from "@/components/MhiLogo";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-background via-background to-muted/40">
      <div className="flex flex-col items-center gap-4 mb-8">
        <MhiLogo href="/" size="home" className="shrink-0" />
        <p className="text-muted-foreground text-center text-lg max-w-md">
          Réseau des églises d&apos;Île-de-France
        </p>
      </div>
      <HomeClient />
    </main>
  );
}
