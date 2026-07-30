import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const total = slides.length;

  useEffect(() => {
    setMounted(true);
  }, []);

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
        {vid ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
              alt={current.heading}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <iframe
              key={`prev-${current.id}`}
              className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              src={`https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
              title={current.heading}
              allow="autoplay; encrypted-media"
            />
          </>
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-white/15 backdrop-blur ring-2 ring-white/70 grid place-items-center transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/80">
            <Play className="h-6 w-6 md:h-7 md:w-7 text-white fill-white ml-0.5" />
          </div>
        </div>
      </button>

      {/* Prev / Next OUTSIDE the frame + dots */}
      {total > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + total) % total)}
            aria-label="আগের ভিডিও"
            className="h-10 w-10 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground grid place-items-center shadow-sm transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`স্লাইড ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? "w-8 bg-primary" : "w-2 bg-border hover:bg-primary/50"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % total)}
            aria-label="পরের ভিডিও"
            className="h-10 w-10 rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground grid place-items-center shadow-sm transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Enlarged modal via Portal */}
      {mounted && open && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md animate-in fade-in duration-200 flex items-center justify-center p-4 sm:p-6 md:p-8"
          onClick={() => setOpen(false)}
        >
          {/* Main Modal Box */}
          <div
            className="relative w-full max-w-3xl md:max-w-4xl flex flex-col items-center animate-in zoom-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button — top-right of modal box */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="বন্ধ করুন"
              className="absolute -top-12 right-0 sm:-right-2 z-[100000] h-10 w-10 rounded-full bg-white text-black hover:bg-white/90 grid place-items-center shadow-2xl transition-transform hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10">
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

            {/* Title & Subtitle */}
            <div className="mt-4 text-center text-white px-2 max-w-2xl">
              <h3 className="text-lg md:text-xl font-bold">{current.heading}</h3>
              {current.subheading && (
                <p className="mt-1 text-sm text-white/70">{current.subheading}</p>
              )}
            </div>

            {/* Carousel Navigation */}
            {total > 1 && (
              <div className="mt-4 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setIdx((i) => (i - 1 + total) % total)}
                  aria-label="আগের"
                  className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/30 text-white grid place-items-center backdrop-blur transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setIdx(i)}
                      aria-label={`স্লাইড ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        i === idx ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIdx((i) => (i + 1) % total)}
                  aria-label="পরের"
                  className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/30 text-white grid place-items-center backdrop-blur transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
