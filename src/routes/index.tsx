import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Users, Award, PlayCircle, Sparkles, Star, GraduationCap as GradIcon, BookOpen, UserCheck, TrendingUp, ChevronDown, ChevronLeft, ChevronRight, Calendar, Clock, Crown, BadgeCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { CourseCard } from "@/components/site/CourseCard";
import { api } from "@/lib/api";
import { MOCK_HERO_VIDEOS, MOCK_VIDEO_GALLERY } from "@/lib/mock-data";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import VideoGallery from "@/components/site/VideoGallery";
import { toBn } from "@/lib/format";
import { useContent } from "@/lib/content-store";
import { HOME_CONTENT_DEFAULTS, CONTENT_KEYS } from "@/lib/content-defaults";
import trainer1 from "@/assets/trainer-1.png";
import trainer2 from "@/assets/trainer-2.png";
import trainer3 from "@/assets/trainer-3.png";
import trainer4 from "@/assets/trainer-4.png";


const TRAINER_IMAGES: Record<string, string> = {
  "trainer-1": trainer1,
  "trainer-2": trainer2,
  "trainer-3": trainer3,
  "trainer-4": trainer4,
};

const featuredQuery = queryOptions({
  queryKey: ["courses", "featured"],
  queryFn: () => api<{ courses: any[] }>("courses/list.php", { query: { featured: 1 } }),
});
const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => api<{ categories: any[] }>("courses/categories.php"),
});
const trainersQuery = queryOptions({
  queryKey: ["trainers"],
  queryFn: () => api<{ trainers: any[] }>("content/trainers.php"),
});
const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: () => api<{ testimonials: any[] }>("content/testimonials.php"),
});
const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: () => api<{ faqs: { q: string; a: string }[] }>("content/faqs.php"),
});
const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => api<{ posts: any[] }>("content/posts.php"),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NextScale Academy — বাংলাদেশের অনলাইন লার্নিং প্ল্যাটফর্ম" },
      { name: "description", content: "প্রফেশনাল কোর্সে ক্যারিয়ার গড়ুন। ওয়েব ডেভেলপমেন্ট, ডিজাইন, মার্কেটিং, ভিডিও এডিটিং ও আরও অনেক কিছু।" },
      { property: "og:title", content: "NextScale Academy — অনলাইন কোর্স" },
      { property: "og:description", content: "ইন্ডাস্ট্রি এক্সপার্টদের কাছ থেকে শিখুন।" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(featuredQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(trainersQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
      context.queryClient.ensureQueryData(faqsQuery),
      context.queryClient.ensureQueryData(postsQuery),
    ]);
  },
  component: HomePage,
  pendingComponent: () => <SiteLayout><div className="min-h-[60vh]" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">ত্রুটি: {error.message}</div></SiteLayout>,
});

function parseBengaliOrEnglishNumber(str: string): { target: number; suffix: string; prefix: string; hasComma: boolean; isBn: boolean } {
  if (!str) return { target: 0, suffix: "", prefix: "", hasComma: false, isBn: false };

  const bnToEnMap: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };

  let cleanStr = "";
  let isBn = false;
  let prefix = "";
  let suffix = "";
  const hasComma = str.includes(",") || str.includes("،");

  const digitRegex = /[0-9০-৯]/;
  const firstDigitIdx = str.search(digitRegex);
  let lastDigitIdx = -1;

  for (let i = str.length - 1; i >= 0; i--) {
    if (digitRegex.test(str[i])) {
      lastDigitIdx = i;
      break;
    }
  }

  if (firstDigitIdx !== -1 && lastDigitIdx !== -1) {
    prefix = str.slice(0, firstDigitIdx);
    suffix = str.slice(lastDigitIdx + 1);

    const digitPart = str.slice(firstDigitIdx, lastDigitIdx + 1);
    for (const char of digitPart) {
      if (bnToEnMap[char] !== undefined) {
        cleanStr += bnToEnMap[char];
        isBn = true;
      } else if (/[0-9]/.test(char)) {
        cleanStr += char;
      }
    }
  }

  const target = parseInt(cleanStr, 10) || 0;

  return { target, suffix, prefix, hasComma, isBn };
}

function AnimatedStatCard({ icon: Icon, value, label, delay = 0 }: { icon: any; value: string; label: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { target, suffix, prefix, hasComma, isBn } = parseBengaliOrEnglishNumber(value);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || target === 0) return;

    let animationFrameId: number;
    let startTime: number | null = null;
    const duration = 1800;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;

      if (elapsed < 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easedProgress * target);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isVisible, target, delay]);

  let numStr = count.toLocaleString("en-US");
  if (!hasComma) {
    numStr = count.toString();
  }

  if (isBn) {
    numStr = toBn(numStr);
  }

  const displayString = target === 0 ? value : `${prefix}${numStr}${suffix}`;

  return (
    <div
      ref={cardRef}
      className={`text-center transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center">
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">{displayString}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function CategoryAutoScroll({ categories }: { categories: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationFrameId: number;
    const speed = 0.6;

    const scroll = () => {
      if (!isHovered && el && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, categories]);

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/carousel mt-6">
      <button
        type="button"
        onClick={() => scrollByAmount(-280)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/90 border border-border shadow-md grid place-items-center text-foreground hover:bg-accent transition-opacity opacity-0 group-hover/carousel:opacity-100"
        aria-label="Previous categories"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to="/courses"
            search={{ category: cat.slug }}
            className="w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] min-w-[200px] flex-shrink-0 rounded-xl border border-border bg-card p-5 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="text-3xl">{["💻", "🎨", "📈", "🎬"][cat.id % 4] ?? "📚"}</div>
            <div className="mt-3 font-semibold group-hover:text-primary">{cat.name}</div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(280)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/90 border border-border shadow-md grid place-items-center text-foreground hover:bg-accent transition-opacity opacity-0 group-hover/carousel:opacity-100"
        aria-label="Next categories"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function AutoScrollingCarousel<T>({
  items,
  renderItem,
  itemClassName = "w-[80vw] max-w-[280px] flex-shrink-0 snap-center",
  intervalMs = 3000,
}: {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  itemClassName?: string;
  intervalMs?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || items.length <= 1) return;

    const timer = setInterval(() => {
      if (isPaused) return;

      const children = Array.from(el.children) as HTMLElement[];
      if (!children.length) return;

      let currentIdx = 0;
      let minDiff = Infinity;
      children.forEach((child, i) => {
        const diff = Math.abs(child.offsetLeft - el.offsetLeft - el.scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          currentIdx = i;
        }
      });

      const nextIdx = (currentIdx + 1) % items.length;
      const targetChild = children[nextIdx];
      if (targetChild) {
        el.scrollTo({ left: targetChild.offsetLeft - el.offsetLeft, behavior: "smooth" });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, items.length, intervalMs]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 2500)}
      className="mt-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar px-4 pb-4 -mx-4 flex gap-5 justify-start"
    >
      {items.map((item, idx) => (
        <div key={idx} className={itemClassName}>
          {renderItem(item, idx)}
        </div>
      ))}
    </div>
  );
}

function AutoScrollingTrainers({ trainers, TrainerCard }: { trainers: any[]; TrainerCard: any }) {
  return (
    <AutoScrollingCarousel
      items={trainers}
      itemClassName="w-[75vw] sm:w-[240px] max-w-[240px] flex-shrink-0 snap-center"
      intervalMs={2800}
      renderItem={(t) => <TrainerCard t={t} />}
    />
  );
}

function HomePage() {
  const { data: featured } = useSuspenseQuery(featuredQuery);
  const { data: cats } = useSuspenseQuery(categoriesQuery);
  const { data: trainers } = useSuspenseQuery(trainersQuery);
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery);
  const { data: faqs } = useSuspenseQuery(faqsQuery);
  const { data: posts } = useSuspenseQuery(postsQuery);
  const [c] = useContent(CONTENT_KEYS.HOME, HOME_CONTENT_DEFAULTS);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/50 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> {c.heroBadge}
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              {c.heroTitle} <span className="text-primary">{c.heroTitleAccent}</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">{c.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={c.heroCta1Href} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-base font-semibold hover:bg-primary/90 transition-colors">
                {c.heroCta1Label} <ArrowRight className="h-4 w-4" />
              </a>
              <a href={c.heroCta2Href} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-semibold hover:bg-accent transition-colors">
                {c.heroCta2Label}
              </a>
            </div>
          </div>

          <div className="relative">
            <HeroCarousel slides={MOCK_HERO_VIDEOS} />
          </div>
        </div>
      </section>

      {/* CTA স্ট্রিপ */}
      <section className="border-b border-border bg-gradient-to-r from-primary/5 via-background to-accent/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> {c.ctaStripText}
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={c.heroCta1Href} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
              {c.heroCta1Label} <ArrowRight className="h-4 w-4" />
            </a>
            <a href={c.heroCta2Href} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-accent transition-colors">
              {c.heroCta2Label}
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-muted/30 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: UserCheck, n: c.stat1, l: c.stat1Label },
            { icon: BookOpen, n: c.stat2, l: c.stat2Label },
            { icon: GradIcon, n: c.stat3, l: c.stat3Label },
            { icon: TrendingUp, n: c.stat4, l: c.stat4Label },
          ].map((s, idx) => (
            <AnimatedStatCard
              key={s.l}
              icon={s.icon}
              value={s.n}
              label={s.l}
              delay={idx * 120}
            />
          ))}
        </div>
      </section>



      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: GraduationCap, title: "এক্সপার্ট ইন্সট্রাক্টর", desc: "ইন্ডাস্ট্রির অভিজ্ঞ প্রফেশনালদের কাছ থেকে শিখুন।" },
            { icon: Award, title: "সার্টিফিকেট", desc: "কোর্স শেষে পাবেন official সার্টিফিকেট।" },
            { icon: Users, title: "কমিউনিটি সাপোর্ট", desc: "শিক্ষার্থী কমিউনিটির সাথে যুক্ত থাকুন সবসময়।" },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">{c.sectionCategoriesTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.sectionCategoriesSubtitle}</p>
        </div>
        <CategoryAutoScroll categories={cats.categories} />
      </section>

      {/* FEATURED COURSES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">{c.sectionFeaturedTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.sectionFeaturedSubtitle}</p>
        </div>

        {/* Mobile View: Auto-Scrolling 1 Course Card at a time */}
        <div className="mt-6 sm:hidden">
          <AutoScrollingCarousel
            items={featured.courses}
            itemClassName="w-[82vw] max-w-[290px] flex-shrink-0 snap-center"
            intervalMs={3000}
            renderItem={(c) => <CourseCard course={c} />}
          />
        </div>

        {/* Desktop View: Grid */}
        <div className="mt-6 hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/courses"
            className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-base md:text-lg font-semibold shadow-lg shadow-primary/25 ring-1 ring-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 transition-all duration-200"
          >
            সব কোর্স দেখুন
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* MENTOR + TRAINERS */}
      <section className="relative overflow-hidden border-y border-border bg-gradient-to-br from-primary/10 via-background to-accent/60">
        {/* Decorative pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
          {/* Section header with side lines */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] font-bold tracking-[0.25em] text-primary uppercase">
              {c.sectionMentorEyebrow}
            </span>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/60" />
              <h2 className="text-2xl md:text-3xl font-bold">
                {c.sectionMentorTitle}
              </h2>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/60" />
            </div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {c.sectionMentorSubtitle}
            </p>
          </div>

          {(() => {
            const trainerList = Array.isArray(trainers.trainers) ? trainers.trainers : [];
            const mentor = trainerList.find((t: any) => t?.is_mentor) ?? trainerList[0];
            if (!mentor) {
              return (
                <div className="mt-10 rounded-xl border border-dashed border-border bg-background/70 p-8 text-center text-sm text-muted-foreground">
                  এখনো কোনো ট্রেনার যোগ করা হয়নি।
                </div>
              );
            }
            const rest = trainerList.filter((t: any) => t?.id !== mentor.id);

            const TrainerCard = ({ t, mentor: isMentor = false }: { t: any; mentor?: boolean }) => {
              const img = t.avatar_url || TRAINER_IMAGES[t.avatar];
              const name = t.name || "ট্রেনার";
              return (
                <Link
                  to="/trainers/$slug"
                  params={{ slug: String(t.slug || t.id || "trainer") }}
                  className="group relative flex flex-col items-center text-center pt-6"
                >
                  {/* Circle + PNG cutout */}
                  <div className="relative w-full max-w-[200px] aspect-square">
                    {/* Outer dashed decorative ring */}
                    <div
                      className={`absolute inset-0 rounded-full border-2 border-dashed transition-transform duration-700 group-hover:rotate-45 ${
                        isMentor ? "border-amber-400/60" : "border-primary/40"
                      }`}
                      style={{ transform: "scale(1.08)" }}
                    />
                    {/* Soft glow */}
                    <div
                      className={`absolute inset-0 rounded-full blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-90 ${
                        isMentor ? "bg-amber-400/50" : "bg-primary/40"
                      }`}
                    />
                    {/* Solid colored circle — clips PNG inside */}
                    <div
                      className={`absolute inset-0 overflow-hidden rounded-full shadow-xl ring-4 ring-white transition-transform duration-500 group-hover:scale-[1.04] ${
                        isMentor
                          ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500"
                          : "bg-gradient-to-br from-primary via-primary to-primary/70"
                      }`}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-white text-6xl font-bold">
                          {name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Mentor crown badge */}
                    {isMentor && (
                      <div className="absolute -top-1 right-1 z-20 h-9 w-9 rounded-full bg-white shadow-lg ring-2 ring-amber-200 grid place-items-center">
                        <Crown className="h-4 w-4 text-amber-500" />
                      </div>
                    )}
                    {/* Rating pill */}
                    <div className="absolute -bottom-1 right-1 z-20 inline-flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-amber-600 shadow-lg ring-1 ring-amber-100">
                      <Star className="h-3 w-3 fill-current" /> {t.rating ?? 5}
                    </div>
                  </div>


                  {/* Name with background pill */}
                  <div
                    className={`relative -mt-3 z-10 inline-flex items-center rounded-lg px-4 py-1.5 shadow-md ring-1 ${
                      isMentor
                        ? "bg-gradient-to-r from-amber-50 to-orange-50 ring-amber-200"
                        : "bg-white ring-primary/15"
                    }`}
                  >
                    <h4
                      className="text-base md:text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary"
                      style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}
                    >
                      {name}
                    </h4>
                  </div>


                  {/* Title pill */}
                  <div
                    className={`mt-2.5 inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md transition-transform group-hover:scale-105 ${
                      isMentor
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-primary to-primary/80"
                    }`}
                  >
                    <BadgeCheck className="h-3 w-3" />
                    <span className="truncate max-w-[180px]">{t.title || "ইন্সট্রাক্টর"}</span>
                  </div>
                </Link>
              );
            };

            return (
              <>
                {/* Mentor on top, centered */}
                <div className="mt-10 flex justify-center">
                  <div className="w-full max-w-[240px]">
                    <TrainerCard t={mentor} mentor />
                  </div>
                </div>

                {/* Divider ornament */}
                <div className="mt-10 flex items-center justify-center gap-2 opacity-60">
                  <span className="h-px w-16 bg-border" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  <span className="h-px w-16 bg-border" />
                </div>

                {/* Auto-Scrolling Trainer Row for Mobile & Desktop */}
                <AutoScrollingTrainers trainers={rest} TrainerCard={TrainerCard} />


                <div className="mt-10 text-center">
                  <Link
                    to="/trainers"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    সব ট্রেনার দেখুন <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            );
          })()}
        </div>
      </section>



      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">{c.sectionTestimonialsTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.sectionTestimonialsSubtitle}</p>
        </div>

        {/* Mobile View: Auto-Scrolling 1 Review at a time */}
        <div className="mt-8 md:hidden">
          <AutoScrollingCarousel
            items={testimonials.testimonials}
            itemClassName="w-[85vw] max-w-[320px] flex-shrink-0 snap-center"
            intervalMs={3200}
            renderItem={(t) => (
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col h-full shadow-sm">
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-current" : "opacity-30"}`} />
                  ))}
                </div>
                <p className="mt-4 text-sm text-foreground/90 leading-relaxed flex-1">"{t.comment}"</p>
                <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                  {t.avatar_image ? (
                    <img src={t.avatar_image} alt={t.name} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.avatar_color} grid place-items-center text-white font-bold`}>
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        {/* Desktop View: Grid */}
        <div className="mt-10 hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.testimonials.map((t) => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-6 flex flex-col">
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>
              <p className="mt-4 text-sm text-foreground/90 leading-relaxed flex-1">"{t.comment}"</p>
              <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                {t.avatar_image ? (
                  <img src={t.avatar_image} alt={t.name} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.avatar_color} grid place-items-center text-white font-bold`}>
                    {t.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold">{c.sectionBlogTitle}</h2>
            <p className="mt-2 text-muted-foreground">{c.sectionBlogSubtitle}</p>
          </div>

          {/* Mobile View: Auto-Scrolling 1 Blog Card at a time */}
          <div className="mt-6 md:hidden">
            <AutoScrollingCarousel
              items={posts.posts.slice(0, 3)}
              itemClassName="w-[82vw] max-w-[290px] flex-shrink-0 snap-center"
              intervalMs={3500}
              renderItem={(p) => (
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="group block h-full rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all shadow-sm">
                  <div className={`aspect-video bg-gradient-to-br ${p.cover_gradient} relative overflow-hidden`}>
                    {p.cover_image && (
                      <img src={p.cover_image} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-xs font-medium">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>
                    <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.published_at}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.read_time}</span>
                    </div>
                  </div>
                </Link>
              )}
            />
          </div>

          {/* Desktop View: Grid */}
          <div className="mt-6 hidden md:grid md:grid-cols-3 gap-5">
            {posts.posts.slice(0, 3).map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all">
                <div className={`aspect-video bg-gradient-to-br ${p.cover_gradient} relative overflow-hidden`}>
                  {p.cover_image && (
                    <img src={p.cover_image} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-xs font-medium">
                    {p.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.published_at}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.read_time}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-base md:text-lg font-semibold shadow-lg shadow-primary/25 ring-1 ring-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 transition-all duration-200"
            >
              সব আর্টিকেল দেখুন
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* VIDEO GALLERY */}
      <section className="relative overflow-hidden border-y border-border bg-gradient-to-b from-background via-muted/40 to-background">
        {/* dotted pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* floating 3D blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-accent/40 blur-3xl animate-pulse"
          style={{ animationDelay: "1.2s" }}
        />
        {/* rotated 3D frame accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-[90%] max-w-4xl rounded-3xl border border-primary/10"
          style={{
            transform: "perspective(1000px) rotateX(35deg) translateY(-40px)",
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--primary) 8%, transparent), transparent)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div
            className="text-center max-w-2xl mx-auto"
            style={{ perspective: "800px" }}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold shadow-sm animate-fade-in"
              style={{ transform: "translateZ(30px)" }}
            >
              <PlayCircle className="h-3.5 w-3.5" /> {c.sectionVideoEyebrow}
            </span>
            <h2
              className="mt-3 text-3xl md:text-4xl font-bold tracking-tight animate-fade-in"
              style={{
                transform: "translateZ(20px)",
                textShadow: "0 6px 24px color-mix(in oklab, var(--primary) 15%, transparent)",
                animationDelay: "80ms",
                animationFillMode: "both",
              }}
            >
              {c.sectionVideoTitle}
            </h2>
            <p
              className="mt-2 text-muted-foreground animate-fade-in"
              style={{ animationDelay: "160ms", animationFillMode: "both" }}
            >
              {c.sectionVideoSubtitle}
            </p>
          </div>

          <div className="mt-12">
            <VideoGallery videos={MOCK_VIDEO_GALLERY} />
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 text-base md:text-lg font-semibold shadow-lg shadow-primary/25 ring-1 ring-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 transition-all duration-200"
            >
              সব ভিডিও দেখুন
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold">{c.sectionFaqTitle}</h2>
          <p className="mt-2 text-muted-foreground">{c.sectionFaqSubtitle}</p>
        </div>
        <div className="mt-8 space-y-3">
          {faqs.faqs.slice(0, 5).map((f, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-accent/50 transition-colors"
              >
                <span className="font-semibold text-sm md:text-base">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 pt-1 text-muted-foreground text-sm leading-relaxed border-t border-border">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/faq" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            সব প্রশ্ন দেখুন <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">{c.finalCtaTitle}</h2>
          <p className="mt-3 opacity-90 max-w-2xl mx-auto">{c.finalCtaSubtitle}</p>
          <a href={c.finalCtaHref} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-background text-foreground px-6 py-3 font-semibold hover:bg-background/90">
            {c.finalCtaButton} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}
