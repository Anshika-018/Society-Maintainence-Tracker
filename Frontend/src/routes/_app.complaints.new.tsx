import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/lib/store";
import { complaintSchema } from "@/lib/schemas";
import { CATEGORIES, type ComplaintCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUpload } from "@/components/photo-upload";

export const Route = createFileRoute("/_app/complaints/new")({
  head: () => ({ meta: [{ title: "Raise a complaint — Society Maintainence Tracker" }] }),
  component: NewComplaintPage,
});

type Values = z.infer<typeof complaintSchema>;

function NewComplaintPage() {
  const { createComplaint } = useApp();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { category: "Plumbing", description: "", photo: null },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const c = await createComplaint({
      category: values.category as ComplaintCategory,
      description: values.description,
      photo,
    });
    toast.success("Complaint submitted");
    navigate({ to: "/complaints/$id", params: { id: c.id } });
  });



  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to="/complaints"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to my complaints
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          Raise a complaint
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Give as much detail as you can — a clear description helps the admin resolve it
          faster.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-xl border bg-card p-5 sm:p-6"
      >
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Select
            value={form.watch("category")}
            onValueChange={(v) => form.setValue("category", v)}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={5}
            placeholder="What's the issue, where is it, and when did you notice it?"
            {...form.register("description")}
          />
          {form.formState.errors.description ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.description.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label>Photo</Label>
          <PhotoUpload value={photo} onChange={setPhoto} />
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/complaints" })}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Submit complaint
          </Button>
        </div>
      </form>
    </div>
  );
}
