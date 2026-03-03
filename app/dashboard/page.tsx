import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
import {
  getUpcomingEvents,
  getAnnouncements,
  getNotifications,
  getUserAndRole,
} from "@/lib/supabase/queries";
import { EventActions } from "@/components/EventActions";
import { LogoutButton } from "./LogoutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EVENT_TYPE_LABELS: Record<string, string> = {
  culte: "Culte",
  etude_biblique: "Étude biblique",
  evenement: "Événement",
  autre: "Autre",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  return `${h}h${m}`;
}

function roleBadgeVariant(
  roleLabel: string
): "default" | "secondary" | "warning" | "outline" {
  if (roleLabel === "Responsable siège") return "default";
  if (roleLabel === "Responsable église") return "secondary";
  if (roleLabel === "Contributeur") return "outline";
  return "warning";
}

function notificationBadgeVariant(
  importance: string
): "destructive" | "warning" | "secondary" | "outline" {
  if (importance === "urgente") return "destructive";
  if (importance === "important") return "warning";
  if (importance === "normal") return "secondary";
  return "outline";
}

export default async function DashboardPage() {
  let auth: Awaited<ReturnType<typeof getUserAndRole>> = null;
  try {
    const supabase = await createClient();
    auth = await getUserAndRole(supabase);
  } catch (err) {
    console.error("[Dashboard] createClient/getUserAndRole:", err);
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-full">
        <div className="max-w-2xl mx-auto rounded-lg border border-destructive/50 bg-destructive/5 p-6">
          <h1 className="text-lg font-semibold text-destructive">Erreur de connexion</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Impossible de contacter le serveur. Vérifiez que <code className="bg-muted px-1 rounded">.env.local</code> contient{" "}
            <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
            <code className="bg-muted px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </p>
        </div>
      </div>
    );
  }

  if (!auth) {
    redirect("/login");
  }

  const { user, roleInfo } = auth;
  const userIsSiege = roleInfo.isSiege;
  const userChurchId = roleInfo.churchId;
  const roleLabel =
    roleInfo.role === "responsable_siège"
      ? "Responsable siège"
      : roleInfo.role === "responsable_eglise"
      ? "Responsable église"
      : roleInfo.role === "contributeur"
      ? "Contributeur"
      : "Non défini";

  let events: Awaited<ReturnType<typeof getUpcomingEvents>> = [];
  let announcements: Awaited<ReturnType<typeof getAnnouncements>> = [];
  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];
  let dataError: string | null = null;
  try {
    [events, announcements, notifications] = await Promise.all([
      getUpcomingEvents(10),
      getAnnouncements(3),
      getNotifications({ limit: 5 }),
    ]);
  } catch (err) {
    dataError =
      err instanceof Error ? err.message : "Erreur lors du chargement des données.";
  }

  const canEditMap = Object.fromEntries(
    events.map((e) => [
      e.id,
      userIsSiege || (roleInfo.isResponsableEglise && userChurchId === e.church_id),
    ])
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-full">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Bienvenue sur le réseau MHI Île-de-France
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={roleBadgeVariant(roleLabel)}>
              Rôle : {roleLabel}
            </Badge>
            <LogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="border-primary/25 bg-white/90 backdrop-blur-sm shadow-md shadow-primary/10 transition-all duration-200 hover:shadow-lg hover:shadow-primary/15 hover:border-primary/40">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">{events.length}</p>
              <p className="text-sm text-muted-foreground">Événements à venir</p>
            </CardContent>
          </Card>
          <Card className="border-primary/25 bg-white/90 backdrop-blur-sm shadow-md shadow-primary/10 transition-all duration-200 hover:shadow-lg hover:shadow-primary/15 hover:border-primary/40">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">{notifications.length}</p>
              <p className="text-sm text-muted-foreground">Notifications</p>
            </CardContent>
          </Card>
        </div>

        {dataError && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive font-medium">{dataError}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Vérifiez la connexion Supabase (.env.local) et que les tables existent.
              </p>
            </CardContent>
          </Card>
        )}

        {roleLabel === "Non défini" && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-100">
                Votre rôle n&apos;est pas encore configuré
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <p>
                Utilisez l&apos;UUID ci-dessous (c&apos;est l&apos;id de votre compte connecté).
                Exécutez la requête dans le <strong>même projet Supabase</strong> que celui
                utilisé par l&apos;app (vérifiez <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> dans .env.local).
              </p>
              <pre className="text-xs font-mono bg-white dark:bg-black/20 p-3 rounded border border-amber-200 dark:border-amber-800 break-all overflow-x-auto">
                INSERT INTO user_roles (user_id, role, church_id)
                {"\n"}VALUES (&apos;{user.id}&apos;, &apos;responsable_siège&apos;, NULL)
                {"\n"}ON CONFLICT (user_id) DO UPDATE SET role = &apos;responsable_siège&apos;, church_id = NULL;
              </pre>
              <p className="text-xs">
                Vérifiez dans Supabase → Authentication → Users que cet UUID correspond bien à votre compte.
              </p>
              <p className="text-xs">
                Puis déconnectez-vous, reconnectez-vous, et rechargez la page (F5 ou Ctrl+F5).
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-md border-border bg-white/95 backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 bg-primary/5 rounded-t-lg">
            <CardTitle className="text-primary">Prochains événements du réseau</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun événement à venir. Les événements créés par les églises apparaîtront ici.
              </p>
            ) : (
              <ul className="space-y-3">
                {events.map((event) => (
                  <li key={event.id}>
                    <Card className="border-border bg-white/90 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/25 hover:bg-white">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <p className="font-medium text-foreground">{event.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(event.event_date)}
                              {event.event_time && ` · ${formatTime(event.event_time)}`}
                              {event.church && ` · ${event.church.name}`}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              {EVENT_TYPE_LABELS[event.type] ?? event.type}
                            </Badge>
                            <EventActions
                              eventId={event.id}
                              canEdit={canEditMap[event.id] ?? false}
                            />
                          </div>
                          {event.location && (
                            <p className="text-xs text-muted-foreground shrink-0">
                              {event.location}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-border bg-white/95 backdrop-blur-sm">
          <CardHeader className="border-b border-border/50 bg-primary/5 rounded-t-lg">
            <CardTitle className="text-primary">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune notification.</p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link href="/notifications" className="block">
                      <Card className="bg-white/85 transition-all duration-200 hover:bg-white hover:shadow-md hover:border-primary/20">
                        <CardContent className="p-4">
                          <Badge variant={notificationBadgeVariant(n.importance)} className="mb-2">
                            {n.importance === "urgente"
                              ? "Urgent"
                              : n.importance === "important"
                              ? "Important"
                              : n.importance === "normal"
                              ? "Normal"
                              : "Info"}
                          </Badge>
                          <p className="font-medium text-foreground">{n.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(n.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/notifications" className={cn(buttonVariants({ variant: "link" }), "p-0 h-auto text-primary")}>
              Voir toutes les notifications →
            </Link>
          </CardContent>
        </Card>

        {announcements.length > 0 && (
          <Card className="shadow-md border-border bg-white/95 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 bg-primary/5 rounded-t-lg">
              <CardTitle className="text-primary">Dernières annonces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {announcements.map((a) => (
                  <li key={a.id}>
                    <Link href={`/annonces/${a.id}`} className="block">
                      <Card className="bg-white/85 transition-all duration-200 hover:bg-white hover:shadow-md hover:border-primary/20">
                        <CardContent className="p-4">
                          <p className="font-medium text-foreground">{a.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(a.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/annonces" className={cn(buttonVariants({ variant: "link" }), "p-0 h-auto text-primary")}>
                Voir toutes les annonces →
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Link href="/events/new" className={cn(buttonVariants({ variant: "outline" }))}>
            + Nouvel événement
          </Link>
          <Link href="/calendar" className={cn(buttonVariants({ variant: "outline" }))}>
            Voir le calendrier
          </Link>
          <Link href="/planning" className={cn(buttonVariants({ variant: "outline" }))}>
            Planning partagé
          </Link>
          {userChurchId && (
            <Link href={`/churches/${userChurchId}/calendrier`} className={cn(buttonVariants({ variant: "outline" }))}>
              Mon calendrier d&apos;église
            </Link>
          )}
          <Link href="/churches" className={cn(buttonVariants({ variant: "outline" }))}>
            Profils des églises
          </Link>
          <Link href="/carte-des-besoins" className={cn(buttonVariants({ variant: "outline" }))}>
            Carte des besoins
          </Link>
          <Link href="/notifications" className={cn(buttonVariants({ variant: "outline" }))}>
            Notifications
          </Link>
          <Link href="/annonces" className={cn(buttonVariants({ variant: "outline" }))}>
            Annonces du siège
          </Link>
          {(userIsSiege || roleInfo.isResponsableEglise) && (
            <Link href="/admin/gestion-utilisateurs" className={cn(buttonVariants({ variant: "outline" }))}>
              Gestion des utilisateurs
            </Link>
          )}
          <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            ← Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
