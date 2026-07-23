import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Users, Award, PlayCircle, Sparkles, Star, GraduationCap as GradIcon, BookOpen, UserCheck, TrendingUp, ChevronDown, Calendar, Clock, Crown, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { CourseCard } from "@/components/site/CourseCard";
import { api } from "@/lib/api";
import { MOCK_HERO_VIDEOS } from "@/lib/mock-data";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { toBn } from "@/lib/format";
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

function HomePage() {
  const { data: featured } = useSuspenseQuery(featuredQuery);
  const { data: cats } = useSuspenseQuery(categoriesQuery);
  const { data: trainers } = useSuspenseQuery(trainersQuery);
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery);
  const { data: faqs } = useSuspenseQuery(faqsQuery);
  const { data: posts } = useSuspenseQuery(postsQuery);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <SiteLayout>
      {/* HERO — টেক্সট + ভিডিও ফ্রেম (ফ্রেমের ভেতরে YouTube ক্যারুসেল, উপরে হেডিং overlay) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/50 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-10 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> নতুন কোর্স যোগ হয়েছে
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              আপনার ভবিষ্যৎ শুরু হোক <span className="text-primary">এখান থেকে</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              ইন্ডাস্ট্রি এক্সপার্টদের কাছ থেকে শিখুন আধুনিক স্কিল। ঘরে বসেই ক্যারিয়ার গড়ুন প্রফেশনাল কোর্সে।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses" className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-base font-semibold hover:bg-primary/90 transition-colors">
                সব কোর্স দেখুন <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-semibold hover:bg-accent transition-colors">
                আমাদের সম্পর্কে
              </Link>
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
            <Sparkles className="h-4 w-4 text-primary" /> নতুন কোর্স যোগ হয়েছে — এখনই এনরোল করুন
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/courses" className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
              সব কোর্স দেখুন <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-accent transition-colors">
              আমাদের সম্পর্কে
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: UserCheck, n: "১০,০০০+", l: "সক্রিয় শিক্ষার্থী" },
            { icon: BookOpen, n: "৫০+", l: "প্রিমিয়াম কোর্স" },
            { icon: GradIcon, n: "২৫+", l: "এক্সপার্ট ট্রেনার" },
            { icon: TrendingUp, n: "৯৮%", l: "সন্তুষ্টির হার" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="mt-3 text-2xl md:text-3xl font-bold">{s.n}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
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
          <h2 className="text-2xl md:text-3xl font-bold">জনপ্রিয় ক্যাটেগরি</h2>
          <p className="mt-2 text-muted-foreground">আপনার পছন্দের বিষয় বেছে নিন</p>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {cats.categories.map((c) => (
            <Link
              key={c.id}
              to="/courses"
              search={{ category: c.slug }}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="text-3xl">{["💻", "🎨", "📈", "🎬"][c.id % 4] ?? "📚"}</div>
              <div className="mt-3 font-semibold group-hover:text-primary">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">ফিচার্ড কোর্স</h2>
          <p className="mt-2 text-muted-foreground">সবচেয়ে জনপ্রিয় কোর্সগুলো</p>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
        <div className="mt-8 text-center">
          <Link to="/courses" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            সব দেখুন <ArrowRight className="h-4 w-4" />
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
              Founder & Team
            </span>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/60" />
              <h2 className="text-2xl md:text-3xl font-bold">
                আমাদের মেন্টর ও ট্রেনার
              </h2>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/60" />
            </div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              ইন্ডাস্ট্রি-অভিজ্ঞ প্রফেশনালদের কাছ থেকে সরাসরি শিখুন
            </p>
          </div>

          {(() => {
            const mentor = trainers.trainers.find((t: any) => t.is_mentor) ?? trainers.trainers[0];
            const rest = trainers.trainers.filter((t: any) => t.id !== mentor.id);

            const TrainerCard = ({ t, mentor: isMentor = false }: { t: any; mentor?: boolean }) => {
              const img = TRAINER_IMAGES[t.avatar];
              return (
                <Link
                  to="/trainers/$slug"
                  params={{ slug: t.slug }}
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
                          alt={t.name}
                          loading="lazy"
                          className="absolute inset-x-0 bottom-0 mx-auto h-[95%] w-auto object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-white text-6xl font-bold">
                          {t.name.charAt(0)}
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
                      <Star className="h-3 w-3 fill-current" /> {t.rating}
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
                      {t.name}
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
                    <span className="truncate max-w-[180px]">{t.title}</span>
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

                {/* Trainer row — 3 cards aligned with mentor above; auto-scroll if more */}
                {rest.length <= 3 ? (
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                    {rest.map((t: any) => <TrainerCard key={t.id} t={t} />)}
                  </div>
                ) : (
                  <div className="mt-8 max-w-3xl mx-auto overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:thin]">
                    <div className="grid grid-flow-col auto-cols-[minmax(0,33.333%)] gap-8 pb-3">
                      {rest.map((t: any) => (
                        <div key={t.id} className="snap-center">
                          <TrainerCard t={t} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}


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
          <h2 className="text-2xl md:text-3xl font-bold">শিক্ষার্থীদের মতামত</h2>
          <p className="mt-2 text-muted-foreground">যারা আমাদের কোর্সে ক্যারিয়ার গড়েছেন — তাদের গল্প।</p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <h2 className="text-2xl md:text-3xl font-bold">সাম্প্রতিক আর্টিকেল</h2>
            <p className="mt-2 text-muted-foreground">শিক্ষা ও ক্যারিয়ার সংক্রান্ত লেখা</p>
          </div>
          <div className="mt-6 grid md:grid-cols-3 gap-5">
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
          <div className="mt-8 text-center">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              সব আর্টিকেল <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold">সাধারণ প্রশ্নাবলী</h2>
          <p className="mt-2 text-muted-foreground">যা আপনি জানতে চাইতে পারেন</p>
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
          <h2 className="text-2xl md:text-3xl font-bold">আজই শুরু করুন আপনার শেখার যাত্রা</h2>
          <p className="mt-3 opacity-90 max-w-2xl mx-auto">
            হাজারো শিক্ষার্থীর সাথে যোগ দিন এবং গড়ুন আপনার স্বপ্নের ক্যারিয়ার।
          </p>
          <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-background text-foreground px-6 py-3 font-semibold hover:bg-background/90">
            ফ্রি রেজিস্টার করুন <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
