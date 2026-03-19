/**
 * URL de base de l'application (pour invitations, réinitialisation mot de passe, etc.).
 * En production Vercel : définir NEXT_PUBLIC_APP_URL ou utiliser VERCEL_URL (auto).
 */
export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
