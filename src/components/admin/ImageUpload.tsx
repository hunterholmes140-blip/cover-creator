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

const DEFAULT_SAMPLES: Record<"landscape" | "square" | "portrait", string> = {
  landscape:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=70",
  square:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=70&crop=faces",
  portrait:
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop&q=70&crop=faces",
};

const RECOMMENDED: Record<"landscape" | "square" | "portrait", string> = {
  landscape: "প্রস্তাবিত সাইজ: 1280×720 (16:9)",
  square: "প্রস্তাবিত সাইজ: 600×600 (1:1) — ফেস সেন্টার",
  portrait: "প্রস্তাবিত সাইজ: 600×800 (3:4)",
};

export function ImageUpload({
  value,
  onChange,
  maxDim = 1200,
  aspect = "landscape",
  sample,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  maxDim?: number;
  aspect?: "landscape" | "square" | "portrait";
  sample?: string;
  hint?: string;
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

  const sampleUrl = sample ?? DEFAULT_SAMPLES[aspect];
  const hintText = hint ?? RECOMMENDED[aspect];

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
            <>
              <img
                src={sampleUrl}
                alt="নমুনা"
                className="h-full w-full object-cover opacity-40"
              />
              <span className="absolute inset-x-0 bottom-0 text-[9px] font-medium text-white bg-black/55 px-1 py-0.5 text-center">
                নমুনা
              </span>
            </>
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
      <div className="text-[11px] text-muted-foreground leading-relaxed">
        {hintText} · JPG/PNG/WEBP — অটো রিসাইজ হবে (max {maxDim}px)।
      </div>
    </div>
  );
}
