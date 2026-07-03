import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { AppHeader } from "@/components/app-header";

export const Route = createFileRoute("/_app")({
  // Client-only: the mock store lives in localStorage which SSR can't read.
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) navigate({ to: "/", replace: true });
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Outlet />
      </div>
    </div>
  );
}
