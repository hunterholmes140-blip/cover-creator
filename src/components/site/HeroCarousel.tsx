import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlide = {
  id: number | string;
  heading: string;
  subheading?: string;
  youtube_url: string;
};

// YouTube URL → video ID
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
  const total = slides.length;

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [total]);

  if (!total) return null;
  const current = slides[idx];
  const vid = ytId(current.youtube_url);

  return (
    <section className="relative w-full overflow-hidden bg-black border-b border-border">
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[80vh]">
        {vid && (
          <iframe
            key={current.id}
            className="absolute inset-0 h-full w-full scale-[1.35] md:scale-125 pointer-events-none"
            src={`https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
            title={current.heading}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}

        {/* dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/50" />

        {/* heading overlay */}
        <div className="absolute inset-0 flex items-end md:items-center">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-10 md:pb-0">
            <div className="max-w-2xl text-white">
              <h1
                key={`h-${current.id}`}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-3xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-lg"
              >
                {current.heading}
              </h1>
              {current.subheading && (
                <p
                  key={`s-${current.id}`}
                  className="animate-in fade-in slide-in-from-bottom-6 duration-700 mt-4 text-base md:text-lg text-white/85 max-w-xl"
                >
                  {current.subheading}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIdx((i) => (i - 1 + total) % total)}
              aria-label="আগের"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 hover:bg-black/60 text-white grid place-items-center backdrop-blur transition"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % total)}
              aria-label="পরের"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 hover:bg-black/60 text-white grid place-items-center backdrop-blur transition"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            {/* dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIdx(i)}
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
    </section>
  );
}
