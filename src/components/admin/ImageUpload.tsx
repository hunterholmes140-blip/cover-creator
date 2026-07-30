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
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-4">
        {/* Preview Box */}
        <div
          className={`relative ${previewCls} rounded-lg border border-dashed border-border bg-muted/40 overflow-hidden grid place-items-center shrink-0 shadow-sm`}
        >
          {value ? (
            <>
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-1 right-1 rounded-full bg-black/70 text-white p-1 hover:bg-red-600 transition-colors"
                title="ছবি সরান"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <img
                src={sampleUrl}
                alt="নমুনা"
                className="h-full w-full object-cover opacity-40"
              />
              <span className="absolute inset-x-0 bottom-0 text-[9px] font-medium text-white bg-black/60 px-1 py-0.5 text-center">
                নমুনা
              </span>
            </>
          )}
        </div>

        {/* Controls: Direct Upload & URL Input Side by Side */}
        <div className="flex-1 min-w-[240px] space-y-2.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              {busy ? "ছবি প্রসেস হচ্ছে..." : "ডিভাইস থেকে ফাইল আপলোড"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted-foreground">
              <LinkIcon className="h-3.5 w-3.5" />
            </div>
            <Input
              value={value.startsWith("data:") ? "" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="অথবা সরাসরি ছবির লিংক (https://...) বসান"
              className="pl-8 text-xs"
            />
          </div>

          <div className="text-[11px] text-muted-foreground leading-relaxed">
            {hintText} · ডিভাইস থেকে ফাইল আপলোড করুন অথবা সরাসরি ইমেজের URL পেস্ট করুন।
          </div>
        </div>
      </div>
    </div>
  );
}
