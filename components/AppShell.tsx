"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { InactivityLogout } from "./InactivityLogout";
import { UserMenu } from "./UserMenu";

const NO_SIDEBAR_PATHS = ["/", "/login", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExportPage = pathname?.startsWith("/planning/export");
  const showSidebar =
    pathname &&
    !NO_SIDEBAR_PATHS.includes(pathname) &&
    !isExportPage;

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <InactivityLogout>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-background px-4">
            <UserMenu />
          </header>
          <main className="flex-1 overflow-y-auto bg-main-content min-h-full">
            <div className="relative z-10">{children}</div>
          </main>
        </div>
      </div>
    </InactivityLogout>
  );
}
