import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";

export type HeroSlide = {
  id: number | string;
  heading: string;
  subheading?: string;
  youtube_url: string;
};

function ytId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    if (m) return m[1];
    return null;
  } catch {
    return null;
  }
}

const AUTOPLAY_MS = 8000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (total <= 1 || open) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [total, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + total) % total);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % total);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, total]);

  if (!total) return null;
  const current = slides[idx];
  const vid = ytId(current.youtube_url);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Heading OUTSIDE the frame */}
      <div className="mb-4 text-center lg:text-left min-h-[68px]">
        <h3
          key={`h-${current.id}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-xl md:text-2xl font-bold leading-snug text-foreground"
          style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}
        >
          {current.heading}
        </h3>
        {current.subheading && (
          <p
            key={`s-${current.id}`}
            className="animate-in fade-in duration-700 mt-1 text-sm text-muted-foreground"
            style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}
          >
            {current.subheading}
          </p>
        )}
      </div>

      {/* Video frame — click to enlarge */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="ভিডিও বড় করে দেখুন"
        className="relative block w-full aspect-video rounded-3xl overflow-hidden shadow-2xl ring-1 ring-primary/20 bg-black group cursor-zoom-in"
      >
        {vid && (
          <iframe
            key={`prev-${current.id}`}
            className="absolute inset-0 h-full w-full scale-[1.5] pointer-events-none"
            src={`https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
            title={current.heading}
            allow="autoplay; encrypted-media"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-white/15 backdrop-blur ring-2 ring-white/70 grid place-items-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/80">
            <Play className="h-6 w-6 md:h-7 md:w-7 text-white fill-white ml-0.5" />
          </div>
        </div>
      </button>

      {/* Enlarged modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 flex items-center justify-center p-4 md:p-10"
          onClick={() => setOpen(false)}
        >
          {/* Close button — top-right of viewport */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            aria-label="বন্ধ করুন"
            className="fixed top-4 right-4 z-[110] h-12 w-12 rounded-full bg-white text-black hover:bg-white/90 grid place-items-center shadow-2xl transition"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {vid && (
              <iframe
                key={`big-${current.id}`}
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${vid}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`}
                title={current.heading}
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            )}
          </div>

          {/* Modal nav */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + total) % total); }}
                aria-label="আগের"
                className="fixed left-3 md:left-8 top-1/2 -translate-y-1/2 z-[105] h-11 w-11 md:h-12 md:w-12 rounded-full bg-white/10 hover:bg-white/25 text-white grid place-items-center backdrop-blur transition"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % total); }}
                aria-label="পরের"
                className="fixed right-3 md:right-8 top-1/2 -translate-y-1/2 z-[105] h-11 w-11 md:h-12 md:w-12 rounded-full bg-white/10 hover:bg-white/25 text-white grid place-items-center backdrop-blur transition"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[105] flex gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                    aria-label={`স্লাইড ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === idx ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
