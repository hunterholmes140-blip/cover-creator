import { useEffect, useRef, useState } from "react";
import { Play, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";

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

/** 3D tilt card that reacts to pointer position */
function TiltCard({
  video,
  index,
  onOpen,
}: {
  video: GalleryVideo;
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const cover = thumb(video.youtube_url);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - y) * 12; // rotateX
    const ry = (x - 0.5) * 14; // rotateY
    setStyle({
      transform: `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
      // custom vars for inner glare
      ["--mx" as any]: `${x * 100}%`,
      ["--my" as any]: `${y * 100}%`,
    });
  };

  const handleLeave = () => {
    setStyle({
      transform: "perspective(1100px) rotateX(0deg) rotateY(0deg)",
    });
  };

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
      style={{ animationDelay: `${index * 90}ms`, perspective: "1400px" }}
    >
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          ...style,
          transformStyle: "preserve-3d",
          transition: "transform 300ms cubic-bezier(.2,.8,.2,1)",
        }}
        className="tilt-card group relative w-full text-left rounded-2xl overflow-hidden border border-border bg-card shadow-lg hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 will-change-transform"
      >
      {/* Thumbnail layer */}
      <div
        className="relative aspect-video overflow-hidden bg-muted"
        style={{ transform: "translateZ(0)" }}
      >
        {cover ? (
          <img
            src={cover}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : null}

        {/* dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        {/* pointer-follow glare */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.35), transparent 40%)",
          }}
        />

        {/* Floating play button (lifted in 3D) */}
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ transform: "translateZ(60px)" }}
        >
          <span className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
            <span className="absolute -inset-2 rounded-full bg-primary/20 blur-xl" />
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 ring-4 ring-white/40 group-hover:scale-110 transition-transform">
              <Play className="h-6 w-6 fill-current translate-x-0.5" />
            </span>
          </span>
        </div>

        {/* Category chip lifted */}
        {video.category ? (
          <span
            className="absolute top-3 left-3 rounded-full bg-white/95 text-foreground px-3 py-1 text-xs font-semibold shadow-lg"
            style={{ transform: "translateZ(40px)" }}
          >
            {video.category}
          </span>
        ) : null}

        {/* Duration chip lifted */}
        {video.duration ? (
          <span
            className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/80 text-white px-2 py-1 text-xs font-medium backdrop-blur-sm shadow-lg"
            style={{ transform: "translateZ(40px)" }}
          >
            <Clock className="h-3 w-3" /> {video.duration}
          </span>
        ) : null}
      </div>

      {/* Text layer lifted slightly for depth */}
      <div className="p-5" style={{ transform: "translateZ(30px)" }}>
        <h3 className="font-semibold text-base md:text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        {video.description ? (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {video.description}
          </p>
        ) : null}
      </div>

      {/* Bottom glow accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-3/4 rounded-[50%] bg-primary/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      </button>
    </div>
  );
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

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-video-card]");
    const step = card ? card.offsetWidth + 32 : el.clientWidth * 0.9;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // Auto-slide every 4s, pause on hover / when modal open
  useEffect(() => {
    if (paused || active) return;
    const el = scrollerRef.current;
    if (!el) return;
    const id = setInterval(() => {
      const maxLeft = el.scrollWidth - el.clientWidth - 4;
      if (el.scrollLeft >= maxLeft) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollBy(1);
      }
    }, 4000);
    return () => clearInterval(id);
  }, [paused, active]);

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={scrollerRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ perspective: "1400px" }}
        >
          {videos.map((v, i) => (
            <div
              key={v.id}
              data-video-card
              className="snap-start shrink-0 w-[85%] sm:w-[46%] lg:w-[31%]"
            >
              <TiltCard video={v} index={i} onOpen={() => setOpenId(v.id)} />
            </div>
          ))}
        </div>

        {/* Nav arrows */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="আগের ভিডিও"
          className="hidden md:grid absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 place-items-center rounded-full bg-background border border-border shadow-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="পরের ভিডিও"
          className="hidden md:grid absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 place-items-center rounded-full bg-background border border-border shadow-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Modal */}
      {active ? (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm p-4 sm:p-8 grid place-items-center animate-fade-in"
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative w-full max-w-5xl animate-scale-in"
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
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
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
