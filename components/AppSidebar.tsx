"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MhiLogo } from "@/components/MhiLogo";
import { createClient } from "@/lib/supabase/client";
import { getMyRoleForNav } from "@/app/admin/actions";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Church,
  MapPin,
  Bell,
  PlusCircle,
  Users,
  Home,
  UserCircle,
  LogOut,
  BookUser,
  ScrollText,
  FolderOpen,
} from "lucide-react";

const allNavItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/profil", label: "Mon profil", icon: UserCircle },
  { href: "/annuaire", label: "Annuaire", icon: BookUser },
  { href: "/events/new", label: "Nouvel événement", icon: PlusCircle },
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/planning", label: "Planning partagé", icon: CalendarDays },
  { href: "/churches", label: "Profils des églises", icon: Church },
  { href: "/documents", label: "Documents partagés", icon: FolderOpen },
  { href: "/carte-des-besoins", label: "Carte des besoins", icon: MapPin },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/gestion-utilisateurs", label: "Gestion des utilisateurs", icon: Users },
  { href: "/journal-activite", label: "Journal d'activité", icon: ScrollText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    getMyRoleForNav().then((r) => setRole(r.role));
  }, []);

  // admin ou responsable_siège (avant migration 020) = droits administrateur
  const isAdmin = role === "admin" || role === "responsable_siège";
  const isResponsableEglise = role === "responsable_eglise";
  const isResponsable = isAdmin || isResponsableEglise;

  const navItems = allNavItems.filter((item) => {
    // Journal d'activité : admin uniquement (pas responsable église, pas Croissy)
    if (item.href === "/journal-activite") return isAdmin;
    // Gestion des utilisateurs : admin ou responsable église
    if (item.href === "/admin/gestion-utilisateurs") return isResponsable;
    // Nouvel événement : responsable siège ou responsable église uniquement.
    if (item.href === "/events/new") return isResponsable;
    return true;
  });

  function isNavItemActive(item: (typeof allNavItems)[0]) {
    if (pathname === item.href) return true;
    if (item.href === "/") return false;
    if (item.href === "/churches")
      return pathname.startsWith("/churches") && !pathname.includes("/calendrier");
    if (item.href === "/calendar")
      return pathname === "/calendar" || (pathname.startsWith("/churches/") && pathname.endsWith("/calendrier"));
    return pathname.startsWith(item.href);
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border text-sidebar-foreground shadow-lg shrink-0 bg-gradient-to-b from-sidebar via-sidebar to-muted/80">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4 bg-sidebar-primary/15 border-b-2 border-b-[var(--mhi-accent)]/40 shadow-sm">
        <MhiLogo href="/dashboard" size="sidebar" />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = isNavItemActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.href === "/documents" ? false : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-2",
                "bg-[var(--sidebar-nav-bg)] text-[var(--sidebar-nav-foreground)]",
                "hover:bg-[var(--sidebar-nav-active-bg)] hover:text-[var(--sidebar-nav-active-foreground)]",
                isActive
                  ? "bg-[var(--sidebar-nav-active-bg)] text-[var(--sidebar-nav-active-foreground)] border-[var(--sidebar-nav-active-bg)] shadow-sm"
                  : "border-transparent"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-white/20 text-[var(--sidebar-nav-active-foreground)]"
                    : "bg-black/5 text-[var(--sidebar-nav-foreground)] group-hover:bg-white/20 group-hover:text-[var(--sidebar-nav-active-foreground)]"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-2 border-transparent",
            "bg-[var(--sidebar-nav-bg)] text-[var(--sidebar-nav-foreground)]",
            "hover:bg-[var(--sidebar-nav-active-bg)] hover:text-[var(--sidebar-nav-active-foreground)] disabled:opacity-50"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-black/5 text-[var(--sidebar-nav-foreground)]">
            <LogOut className="h-4 w-4" />
          </span>
          {loggingOut ? "Déconnexion..." : "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}
