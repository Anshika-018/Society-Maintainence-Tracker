import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/_app/admin")({
  component: AdminGate,
});

function AdminGate() {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      toast.error("Admin access only");
      navigate({ to: "/dashboard", replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== "admin") return null;
  return <Outlet />;
}
