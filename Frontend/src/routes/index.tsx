import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, ShieldCheck, MessageSquare, ClipboardList } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/lib/store";
import { loginSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

type LoginValues = z.infer<typeof loginSchema>;

function LandingPage() {
  const { currentUser, login } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<"resident" | "admin">("resident");

  useEffect(() => {
    if (currentUser) {
      navigate({
        to: currentUser.role === "admin" ? "/admin" : "/dashboard",
        replace: true,
      });
    }
  }, [currentUser, navigate]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });



  const onSubmit = form.handleSubmit(async (values) => {
    const result = await login(values.email, values.password);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Welcome back");
  });

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Left brand panel */}
      <section className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.83 0.15 85 / 0.6), transparent 55%), radial-gradient(circle at 80% 70%, oklch(0.62 0.13 145 / 0.55), transparent 55%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 font-display text-2xl font-semibold">
            <span className="grid size-9 place-items-center rounded-md bg-primary-foreground/15 backdrop-blur">
              <Building2 className="size-5" />
            </span>
            Society Maintainence Tracker
          </div>
          <h1 className="mt-16 max-w-md font-display text-5xl font-semibold leading-tight tracking-tight">
            A calmer way to run your building.
          </h1>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Residents raise complaints with photos, the admin moves them through a clear
            workflow, and everyone stays informed from one shared notice board.
          </p>
        </div>

        <ul className="relative mt-12 grid gap-4">
          {[
            {
              icon: ClipboardList,
              title: "Every complaint, tracked",
              body: "Status history, priority, and overdue detection built in.",
            },
            {
              icon: MessageSquare,
              title: "One shared notice board",
              body: "Important notices pin to the top so nobody misses them.",
            },
            {
              icon: ShieldCheck,
              title: "Roles that fit the job",
              body: "Residents see their own. Admins see the whole society.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-primary-foreground/15">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-primary-foreground/75">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Login form */}
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </span>
            <span className="font-display text-xl font-semibold">Society Maintainence Tracker</span>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Sign in as {role}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === "admin"
              ? "Admin access to complaints, notices, and settings."
              : "Resident access to raise complaints and read notices."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Sign in as</Label>
              <div className="grid grid-cols-2 gap-2 rounded-md border border-input bg-background p-1">
                {(["resident", "admin"] as const).map((r) => {
                  const active = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
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
                autoComplete="current-password"
                placeholder="At least 6 characters"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link
              to="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
