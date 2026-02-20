"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

type UserMeta = Record<string, unknown>;

type Props = {
  user: {
    id: string;
    email: string;
    user_metadata: UserMeta;
  };
};

export function ProfilClient({ user: initialUser }: Props) {
  const { theme, setTheme } = useTheme();
  const [first_name, setFirst_name] = useState(
    (initialUser.user_metadata?.first_name as string) ?? ""
  );
  const [full_name, setFull_name] = useState(
    (initialUser.user_metadata?.full_name as string) ?? ""
  );
  const [avatar_url, setAvatar_url] = useState(
    (initialUser.user_metadata?.avatar_url as string) ?? ""
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const supabase = createClient();

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setProfileSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: first_name.trim() || undefined,
        full_name: full_name.trim() || undefined,
        avatar_url: avatar_url.trim() || undefined,
      },
    });
    setProfileSaving(false);
    if (error) {
      setProfileMessage({ type: "error", text: error.message });
      return;
    }
    setProfileMessage({ type: "ok", text: "Profil enregistré." });
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage({ type: "ok", text: "Mot de passe mis à jour." });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Email du compte : <strong>{initialUser.email}</strong> (non modifiable ici)
          </p>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-1">
                Prénom
              </label>
              <input
                id="first_name"
                type="text"
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-1">
                Nom complet
              </label>
              <input
                id="full_name"
                type="text"
                value={full_name}
                onChange={(e) => setFull_name(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                placeholder="Nom et prénom"
              />
            </div>
            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium text-foreground mb-1">
                Photo (URL)
              </label>
              <input
                id="avatar_url"
                type="url"
                value={avatar_url}
                onChange={(e) => setAvatar_url(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                placeholder="https://..."
              />
              {avatar_url && (
                <div className="mt-2">
                  <img
                    src={avatar_url}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover border border-border"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>
            {profileMessage && (
              <p
                className={cn(
                  "text-sm",
                  profileMessage.type === "ok" ? "text-green-600 dark:text-green-400" : "text-destructive"
                )}
              >
                {profileMessage.text}
              </p>
            )}
            <button
              type="submit"
              disabled={profileSaving}
              className={cn(buttonVariants())}
            >
              {profileSaving ? "Enregistrement..." : "Enregistrer le profil"}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-foreground mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            {passwordMessage && (
              <p
                className={cn(
                  "text-sm",
                  passwordMessage.type === "ok" ? "text-green-600 dark:text-green-400" : "text-destructive"
                )}
              >
                {passwordMessage.text}
              </p>
            )}
            <button
              type="submit"
              disabled={passwordSaving || !newPassword || !confirmPassword}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {passwordSaving ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apparence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Choisir le mode d&apos;affichage (clair ou sombre).
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition",
                theme === "light"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              <Sun className="h-4 w-4" />
              Clair
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition",
                theme === "dark"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              <Moon className="h-4 w-4" />
              Sombre
            </button>
          </div>
        </CardContent>
      </Card>

      <p>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }))}>
          ← Tableau de bord
        </Link>
      </p>
    </div>
  );
}
