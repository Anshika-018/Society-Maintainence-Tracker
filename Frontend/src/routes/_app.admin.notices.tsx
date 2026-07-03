import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2, X, Megaphone } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/lib/store";
import { noticeSchema } from "@/lib/schemas";
import type { Notice } from "@/lib/types";
import { NoticeCard } from "@/components/notice-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/admin/notices")({
  head: () => ({ meta: [{ title: "Manage notices — Society Maintainence Tracker" }] }),
  component: ManageNoticesPage,
});

type Values = z.infer<typeof noticeSchema>;

function ManageNoticesPage() {
  const { notices, createNotice, updateNotice, deleteNotice } = useApp();
  const [editing, setEditing] = useState<Notice | null>(null);
  const [showForm, setShowForm] = useState(false);

  const ordered = [
    ...notices.filter((n) => n.important),
    ...notices
      .filter((n) => !n.important)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
  ];

  const startNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const startEdit = (n: Notice) => {
    setEditing(n);
    setShowForm(true);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Notice board
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post announcements for the whole society. Pin the important ones.
          </p>
        </div>
        {!showForm ? (
          <Button onClick={startNew}>
            <Plus className="size-4" />
            New notice
          </Button>
        ) : null}
      </header>

      {showForm ? (
        <NoticeForm
          initial={editing}
          onCancel={() => setShowForm(false)}
          onSubmit={async (vals) => {
            if (editing) {
              await updateNotice(editing.id, vals);
              toast.success("Notice updated");
            } else {
              await createNotice(vals);
              toast.success("Notice posted");
            }
            setShowForm(false);
            setEditing(null);
          }}
        />
      ) : null}

      {ordered.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-5" />}
          title="No notices yet"
          description="Post your first announcement — it'll appear on every resident's dashboard."
          action={<Button onClick={startNew}>Post a notice</Button>}
        />
      ) : (
        <div className="space-y-3">
          {ordered.map((n) => (
            <NoticeCard
              key={n.id}
              notice={n}
              actions={
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(n)}
                    aria-label="Edit notice"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="Delete notice">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this notice?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Residents will no longer see it on the notice board. This can't
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            await deleteNotice(n.id);
                            toast.success("Notice deleted");
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoticeForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: Notice | null;
  onSubmit: (values: Values) => void;
  onCancel: () => void;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: initial?.title ?? "",
      body: initial?.body ?? "",
      important: initial?.important ?? false,
    },
  });

  const submit = form.handleSubmit(onSubmit);

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border bg-card p-5 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          {initial ? "Edit notice" : "New notice"}
        </h2>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="Close">
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g. Water tank cleaning" {...form.register("title")} />
        {form.formState.errors.title ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          rows={5}
          placeholder="What do residents need to know?"
          {...form.register("body")}
        />
        {form.formState.errors.body ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.body.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
        <div>
          <p className="text-sm font-medium">Pin as important</p>
          <p className="text-xs text-muted-foreground">
            Pinned notices stay at the top and trigger an email to residents.
          </p>
        </div>
        <Switch
          checked={form.watch("important")}
          onCheckedChange={(v) => form.setValue("important", v)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? "Save changes" : "Post notice"}</Button>
      </div>
    </form>
  );
}
