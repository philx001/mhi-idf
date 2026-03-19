"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun, Upload, X } from "lucide-react";

/** Doit correspondre exactement au nom du bucket dans Supabase > Storage. */
const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
  const [email, setEmail] = useState(initialUser.email ?? "");
  const [phone, setPhone] = useState(
    (initialUser.user_metadata?.phone as string) ?? ""
  );
  const [avatar_url, setAvatar_url] = useState(
    (initialUser.user_metadata?.avatar_url as string) ?? ""
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [rgpdConsent, setRgpdConsent] = useState(false);
  const hasRgpdConsent = (initialUser.user_metadata?.rgpd_consent_date as string) != null;

  const supabase = createClient();

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setProfileMessage({ type: "error", text: "Format accepté : JPEG, PNG, WebP ou GIF." });
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setProfileMessage({ type: "error", text: `Taille max : ${MAX_AVATAR_SIZE_MB} Mo.` });
      return;
    }
    setProfileMessage(null);
    setAvatarUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${initialUser.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true });
    setAvatarUploading(false);
    if (uploadError) {
      setProfileMessage({ type: "error", text: uploadError.message });
      return;
    }
    const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    setAvatar_url(urlData.publicUrl);
    setProfileMessage({ type: "ok", text: "Photo mise à jour. Enregistrez le profil pour la conserver." });
    e.target.value = "";
  }

  async function handleRemoveAvatar() {
    if (!avatar_url) return;
    const path = avatar_url.split("/").slice(-2).join("/");
    if (!path.startsWith(initialUser.id + "/")) return;
    setAvatarUploading(true);
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
    setAvatarUploading(false);
    setAvatar_url("");
    setProfileMessage({ type: "ok", text: "Photo supprimée. Enregistrez le profil." });
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    const fn = first_name.trim();
    const ln = full_name.trim();
    const em = email.trim();
    const ph = phone.trim();
    if (!fn) {
      setProfileMessage({ type: "error", text: "Le prénom est obligatoire." });
      return;
    }
    if (!ln) {
      setProfileMessage({ type: "error", text: "Le nom est obligatoire." });
      return;
    }
    if (!em) {
      setProfileMessage({ type: "error", text: "L’email est obligatoire." });
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(em)) {
      setProfileMessage({ type: "error", text: "Adresse email invalide." });
      return;
    }
    if (!ph) {
      setProfileMessage({ type: "error", text: "Le numéro de téléphone est obligatoire." });
      return;
    }
    if (!hasRgpdConsent && !rgpdConsent) {
      setProfileMessage({ type: "error", text: "Veuillez accepter le traitement de vos données personnelles (RGPD) avant d'enregistrer." });
      return;
    }
    setProfileSaving(true);
    const { error } = await supabase.auth.updateUser({
      email: em,
      data: {
        first_name: fn,
        full_name: ln,
        phone: ph,
        avatar_url: avatar_url.trim() || undefined,
        ...(rgpdConsent && { rgpd_consent_date: new Date().toISOString() }),
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
          <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-foreground mb-1">
                Prénom <span className="text-destructive">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                value={first_name}
                onChange={(e) => setFirst_name(e.target.value)}
                required
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-1">
                Nom <span className="text-destructive">*</span>
              </label>
              <input
                id="full_name"
                type="text"
                value={full_name}
                onChange={(e) => setFull_name(e.target.value)}
                required
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                placeholder="vous@exemple.fr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                En cas de changement d&apos;email, un lien de confirmation sera envoyé à la nouvelle adresse. La connexion restera possible avec l&apos;ancienne adresse jusqu&apos;à ce que vous cliquiez sur ce lien.
              </p>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                Téléphone <span className="text-destructive">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring"
                placeholder="06 12 34 56 78"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Photo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={handleAvatarUpload}
                className="hidden"
                aria-hidden
              />
              <div className="flex items-center gap-4">
                {avatar_url && (
                  <div className="relative">
                    <img
                      src={avatar_url}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full object-cover border border-border"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground p-1 hover:opacity-90"
                      title="Supprimer la photo"
                      aria-label="Supprimer la photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-muted transition",
                    avatarUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Upload className="h-4 w-4" />
                  {avatarUploading ? "Upload..." : avatar_url ? "Changer la photo" : "Téléverser une photo"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WebP ou GIF — max {MAX_AVATAR_SIZE_MB} Mo
              </p>
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
              disabled={
                profileSaving ||
                !first_name.trim() ||
                !full_name.trim() ||
                !email.trim() ||
                !phone.trim() ||
                (!hasRgpdConsent && !rgpdConsent)
              }
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

      <Card id="rgpd" className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-lg">Protection des données personnelles (RGPD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-3 text-foreground/90">
            <p>
              <strong>Responsable du traitement</strong> : L&apos;application MHI-IDF (Réseau des églises d&apos;Île-de-France) traite vos données personnelles pour la gestion des membres et des activités du réseau.
            </p>
            <p>
              <strong>Données collectées</strong> : prénom, nom, adresse email, numéro de téléphone, photo de profil, ainsi que vos affiliations aux églises et votre participation aux événements.
            </p>
            <p>
              <strong>Finalités</strong> : gestion des comptes utilisateurs, attribution des rôles (membre, responsable d&apos;église), coordination des églises du réseau, organisation des événements et communications internes.
            </p>
            <p>
              <strong>Base légale</strong> : exécution du contrat (utilisation du service) et consentement explicite pour les données facultatives.
            </p>
            <p>
              <strong>Destinataires</strong> : les responsables d&apos;église et administrateurs du réseau peuvent accéder aux données nécessaires à leur mission. Les données sont hébergées par Supabase (Union européenne).
            </p>
            <p>
              <strong>Durée de conservation</strong> : vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, les données sont effacées dans les délais légaux.
            </p>
            <p>
              <strong>Vos droits</strong> : vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données. Vous pouvez vous opposer au traitement ou introduire une réclamation auprès de la CNIL (www.cnil.fr).
            </p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={rgpdConsent || hasRgpdConsent}
              onChange={(e) => setRgpdConsent(e.target.checked)}
              disabled={hasRgpdConsent}
              className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
              aria-describedby="rgpd-summary"
            />
            <span id="rgpd-summary" className="text-foreground font-medium">
              {hasRgpdConsent
                ? "J'ai déjà accepté le traitement de mes données personnelles."
                : "J'ai lu les informations ci-dessus et j'accepte le traitement de mes données personnelles conformément au RGPD."}
            </span>
          </label>
          {!hasRgpdConsent && (
            <p className="text-xs">
              La case doit être cochée pour enregistrer votre profil. Votre consentement sera enregistré avec la date.
            </p>
          )}
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
