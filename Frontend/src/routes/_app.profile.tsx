import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/lib/store";
import { profileSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Society Maintainence Tracker" }] }),
  component: ProfilePage,
});

type Values = z.infer<typeof profileSchema>;

function ProfilePage() {
  const { currentUser, updateProfile, logout } = useApp();
  const navigate = useNavigate();

  const form = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name ?? "",
      flat: currentUser?.flat ?? "",
      phone: currentUser?.phone ?? "",
    },
  });

  if (!currentUser) return null;

  const onSubmit = form.handleSubmit(async (values) => {
    await updateProfile(values);
    toast.success("Profile updated");
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {currentUser.role === "admin" ? "Society admin" : "Resident"} ·{" "}
          {currentUser.email}
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border bg-card p-5 sm:p-6"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Anshika Srivastava</Label>
          <Input id="name" {...form.register("name")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="flat">Flat / Unit</Label>
            <Input id="flat" {...form.register("flat")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" inputMode="tel" {...form.register("phone")} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Sign out</h2>
            <p className="text-sm text-muted-foreground">
              You'll be returned to the sign in page.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate({ to: "/", replace: true });
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
