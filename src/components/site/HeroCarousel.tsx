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

/**
 * ভিডিও ক্যারুসেল — parent ফ্রেমকে পুরোপুরি fill করে।
 * ব্যবহার: parent-এ aspect ও rounded/overflow দিন, এই কম্পোনেন্ট absolute-fill হবে।
 */
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
    <div className="absolute inset-0 bg-black">
      {vid && (
        <iframe
          key={current.id}
          className="absolute inset-0 h-full w-full scale-[1.5] pointer-events-none"
          src={`https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`}
          title={current.heading}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}

      {/* dark gradient for text legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

      {/* heading overlay (top of video) */}
      <div className="absolute inset-x-0 top-0 p-4 md:p-5">
        <h3
          key={`h-${current.id}`}
          className="animate-in fade-in slide-in-from-top-3 duration-500 text-white text-lg md:text-2xl font-bold leading-tight drop-shadow-lg line-clamp-2"
          style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}
        >
          {current.heading}
        </h3>
        {current.subheading && (
          <p
            key={`s-${current.id}`}
            className="animate-in fade-in duration-700 mt-1 text-white/85 text-xs md:text-sm line-clamp-2"
            style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}
          >
            {current.subheading}
          </p>
        )}
      </div>

      {/* controls */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + total) % total)}
            aria-label="আগের"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-9 md:w-9 rounded-full bg-black/50 hover:bg-black/70 text-white grid place-items-center backdrop-blur transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % total)}
            aria-label="পরের"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 md:h-9 md:w-9 rounded-full bg-black/50 hover:bg-black/70 text-white grid place-items-center backdrop-blur transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`স্লাইড ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
