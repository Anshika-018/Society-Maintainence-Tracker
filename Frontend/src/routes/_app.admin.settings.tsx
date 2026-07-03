import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useApp } from "@/lib/store";
import { settingsSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin — Society Maintainence Tracker" }] }),
  component: SettingsPage,
});

type Values = z.infer<typeof settingsSchema>;

function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const form = useForm<Values>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { overdueDays: settings.overdueDays },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await updateSettings({ overdueDays: values.overdueDays });
    toast.success("Overdue threshold updated");
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how the tracker behaves for the whole society.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border bg-card p-5 sm:p-6"
      >
        <div className="space-y-1.5">
          <Label htmlFor="overdueDays">Overdue threshold (days)</Label>
          <Input
            id="overdueDays"
            type="number"
            min={1}
            max={90}
            {...form.register("overdueDays")}
          />
          <p className="text-xs text-muted-foreground">
            Unresolved complaints older than this are automatically flagged as overdue
            and pinned to the top of the admin list.
          </p>
          {form.formState.errors.overdueDays ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.overdueDays.message}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  );
}
