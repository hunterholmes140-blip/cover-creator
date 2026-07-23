import { useEffect, useState } from "react";
import { Play, X, Clock } from "lucide-react";

export type GalleryVideo = {
  id: number | string;
  title: string;
  description?: string;
  youtube_url: string;
  duration?: string;
  category?: string;
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

function thumb(url: string) {
  const id = ytId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

export default function VideoGallery({ videos }: { videos: GalleryVideo[] }) {
  const [openId, setOpenId] = useState<string | number | null>(null);
  const active = videos.find((v) => v.id === openId) ?? null;

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => {
          const cover = thumb(v.youtube_url);
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setOpenId(v.id)}
              className="group text-left rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/60 hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 transition-all duration-200"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {cover ? (
                  <img
                    src={cover}
                    alt={v.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                {/* dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

                {/* play button */}
                <div className="absolute inset-0 grid place-items-center">
                  <span className="relative flex h-16 w-16 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    <span className="relative grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-white/30 group-hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 fill-current translate-x-0.5" />
                    </span>
                  </span>
                </div>

                {/* category chip */}
                {v.category ? (
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 text-foreground px-3 py-1 text-xs font-semibold shadow">
                    {v.category}
                  </span>
                ) : null}

                {/* duration chip */}
                {v.duration ? (
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/75 text-white px-2 py-1 text-xs font-medium backdrop-blur-sm">
                    <Clock className="h-3 w-3" /> {v.duration}
                  </span>
                ) : null}
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-base md:text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {v.title}
                </h3>
                {v.description ? (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {v.description}
                  </p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {active ? (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm p-4 sm:p-8 grid place-items-center"
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenId(null)}
              aria-label="বন্ধ করুন"
              className="absolute -top-12 right-0 sm:-right-2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-black hover:bg-white/90 shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
              <iframe
                key={active.id}
                title={active.title}
                src={`https://www.youtube.com/embed/${ytId(active.youtube_url)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 text-white">
              <h3 className="text-lg md:text-xl font-semibold">{active.title}</h3>
              {active.description ? (
                <p className="mt-1 text-sm text-white/70">{active.description}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
