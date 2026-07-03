import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB (data URL bloats to ~2.7MB in localStorage)
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!ACCEPT.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.onerror = () => toast.error("Could not read that image");
    reader.readAsDataURL(file);
  };

  if (value) {
    return (
      <div className="group relative overflow-hidden rounded-lg border">
        <img
          src={value}
          alt="Complaint attachment preview"
          className="max-h-72 w-full object-cover"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur transition hover:bg-background"
        >
          <X className="size-3.5" />
          Remove
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition ${
        dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30"
      }`}
    >
      <div className="grid size-11 place-items-center rounded-full bg-accent/40 text-accent-foreground">
        <ImagePlus className="size-5" />
      </div>
      <div>
        <p className="text-sm font-medium">Add a photo (optional)</p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP — up to 2 MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        Choose file
      </Button>
    </div>
  );
}
