import { useRef, useState } from "react";
import { Upload, X, Link as LinkIcon } from "lucide-react";
import { Input, Button } from "./ui";

/**
 * Auto-resizes selected image to a max dimension and returns a JPEG data URL.
 * Keeps file size small enough to store inline in JSON content.
 */
async function fileToResizedDataUrl(
  file: File,
  maxDim = 1200,
  quality = 0.82,
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  // PNG with transparency and small SVG: keep as-is
  if (file.type === "image/svg+xml") return dataUrl;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  const hasAlpha = file.type === "image/png" || file.type === "image/webp";
  return canvas.toDataURL(hasAlpha ? "image/png" : "image/jpeg", quality);
}

export function ImageUpload({
  value,
  onChange,
  maxDim = 1200,
  aspect = "landscape",
}: {
  value: string;
  onChange: (v: string) => void;
  maxDim?: number;
  aspect?: "landscape" | "square" | "portrait";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [busy, setBusy] = useState(false);

  const previewCls =
    aspect === "square"
      ? "h-24 w-24"
      : aspect === "portrait"
        ? "h-32 w-24"
        : "h-24 w-40";

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const url = await fileToResizedDataUrl(file, maxDim);
      onChange(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-3">
        <div
          className={`relative ${previewCls} rounded-md border border-dashed border-border bg-muted/40 overflow-hidden grid place-items-center`}
        >
          {value ? (
            <>
              <img src={value} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-0.5 hover:bg-black/80"
                title="সরান"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground px-1 text-center">
              কোন ছবি নেই
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <Upload className="h-3.5 w-3.5" />
            {busy ? "প্রসেস হচ্ছে..." : "ছবি আপ্লোড"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowUrl((s) => !s)}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            URL দিয়ে
          </Button>
        </div>
      </div>
      {showUrl && (
        <Input
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      )}
      <div className="text-[11px] text-muted-foreground">
        JPG/PNG/WEBP — অটো রিসাইজ হবে (max {maxDim}px)।
      </div>
    </div>
  );
}
