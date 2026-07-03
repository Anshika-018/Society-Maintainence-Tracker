import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Building2, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RESIDENT_NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/complaints", label: "My complaints" },
  { to: "/notices", label: "Notice board" },
] as const;

const ADMIN_NAV = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/complaints", label: "Complaints" },
  { to: "/admin/notices", label: "Notices" },
  { to: "/admin/settings", label: "Settings" },
] as const;

export function AppHeader() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!currentUser) return null;
  const isAdmin = currentUser.role === "admin";
  const nav = isAdmin ? ADMIN_NAV : RESIDENT_NAV;

  const handleLogout = () => {
    logout();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          to={isAdmin ? "/admin" : "/dashboard"}
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </span>
          Society Maintainence Tracker
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active =
              item.to === "/admin"
                ? pathname === "/admin"
                : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/profile"
            className="hidden text-right sm:block"
            aria-label="Open profile"
          >
            <p className="text-sm font-medium leading-tight">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Admin" : `Flat ${currentUser.flat}`}
            </p>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Sign out"
            className="hidden md:inline-flex"
          >
            <LogOut className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-muted"
            >
              Sign out
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
