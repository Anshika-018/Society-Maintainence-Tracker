import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/lib/store";
import { registerSchema } from "@/lib/schemas";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Society Maintainence Tracker" },
      {
        name: "description",
        content:
          "Register as a resident or admin to manage society maintenance complaints.",
      },
    ],
  }),
  component: RegisterPage,
});

type Values = z.infer<typeof registerSchema>;

function RegisterPage() {
  const { currentUser, register } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      navigate({
        to: currentUser.role === "admin" ? "/admin" : "/dashboard",
        replace: true,
      });
    }
  }, [currentUser, navigate]);

  const form = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "resident",
      name: "",
      flat: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  const role = form.watch("role");
  const isAdmin = role === "admin";

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const payload = { ...values, flat: values.flat || "" };
    const result = await register(payload as Omit<User, "id">);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success(
      isAdmin ? "Admin account created — welcome" : "Account created — welcome",
    );
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link to="/" className="mb-8 inline-flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold">Society Maintainence Tracker</span>
        </Link>

        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Admins manage complaints, notices, and settings for the society."
            : "Residents can raise complaints and read the notice board."}
        </p>

        {error ? (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1 duration-200">
            ⚠️ {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>I am registering as</Label>
            <div className="grid grid-cols-2 gap-2 rounded-md border border-input bg-background p-1">
              {(["resident", "admin"] as const).map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => form.setValue("role", r)}
                    className={cn(
                      "rounded-sm px-3 py-2 text-sm font-medium capitalize transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Anshika Srivastava" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          {!isAdmin ? (
            <div className="space-y-1.5">
              <Label htmlFor="flat">Flat / Unit</Label>
              <Input
                id="flat"
                placeholder="B-204"
                {...form.register("flat")}
              />
              {form.formState.errors.flat ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.flat.message}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              inputMode="tel"
              placeholder="+91 90000 00000"
              {...form.register("phone")}
            />
            {form.formState.errors.phone ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.phone.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            Create {isAdmin ? "admin " : ""}account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
