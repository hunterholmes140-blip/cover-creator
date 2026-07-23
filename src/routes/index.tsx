import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Users, Award, PlayCircle, Sparkles, Star, GraduationCap as GradIcon, BookOpen, UserCheck, TrendingUp, ChevronDown, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { CourseCard } from "@/components/site/CourseCard";
import { api } from "@/lib/api";
import { toBn } from "@/lib/format";

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
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/50 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
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
            <div className="aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/60 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
              <div className="relative h-full flex flex-col justify-between text-primary-foreground">
                <PlayCircle className="h-16 w-16 opacity-90" />
                <div>
                  <div className="text-sm opacity-80">চলছে</div>
                  <div className="text-2xl font-bold mt-1">লাইভ ক্লাস</div>
                  <div className="text-sm opacity-80 mt-2">{toBn(featured.courses.length)}টি প্রিমিয়াম কোর্স</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">জনপ্রিয় ক্যাটেগরি</h2>
        <p className="mt-2 text-muted-foreground">আপনার পছন্দের বিষয় বেছে নিন</p>
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">ফিচার্ড কোর্স</h2>
            <p className="mt-2 text-muted-foreground">সবচেয়ে জনপ্রিয় কোর্সগুলো</p>
          </div>
          <Link to="/courses" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            সব দেখুন <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>

      {/* MENTOR + TRAINERS */}
      <section className="border-y border-border bg-gradient-to-b from-primary/5 via-accent/40 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Founder</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold">আমাদের সম্পর্কে জানতে চান?</h2>
          </div>

          {(() => {
            const mentor = trainers.trainers.find((t: any) => t.is_mentor) ?? trainers.trainers[0];
            const rest = trainers.trainers.filter((t: any) => t.id !== mentor.id);
            const TrainerCard = ({ t, mentor: isMentor = false }: { t: any; mentor?: boolean }) => (
              <Link
                to="/trainers/$slug"
                params={{ slug: t.slug }}
                className={`group rounded-xl border bg-card p-5 text-center hover:shadow-lg transition-all ${isMentor ? "border-amber-500/60 ring-1 ring-amber-500/30" : "border-border hover:border-primary/40"}`}
              >
                {isMentor && (
                  <span className="inline-block mb-3 rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[10px] font-bold">
                    ⭐ প্রধান মেন্টর
                  </span>
                )}
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-3xl font-bold">
                  {t.name.charAt(0)}
                </div>
                <h4 className="mt-4 font-semibold group-hover:text-primary">{t.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{t.title}</p>
                <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {toBn(t.students)}+</span>
                  <span className="inline-flex items-center gap-1 text-amber-500"><Star className="h-3 w-3 fill-current" /> {t.rating}</span>
                </div>
              </Link>
            );
            return (
              <>
                {/* Mentor on top — same size, centered */}
                <div className="mt-10 max-w-xs mx-auto">
                  <TrainerCard t={mentor} mentor />
                </div>

                {/* Trainers below */}
                <div className="mt-12 flex items-end justify-between">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">আমাদের ট্রেনার</h3>
                    <p className="mt-1 text-sm text-muted-foreground">ইন্ডাস্ট্রি এক্সপার্টদের সাথে পরিচিত হোন</p>
                  </div>
                  <Link to="/trainers" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    সব ট্রেনার <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {rest.slice(0, 4).map((t: any) => <TrainerCard key={t.id} t={t} />)}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
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
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.avatar_color} grid place-items-center text-white font-bold`}>
                  {t.name.charAt(0)}
                </div>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">সাম্প্রতিক আর্টিকেল</h2>
              <p className="mt-2 text-muted-foreground">শিক্ষা ও ক্যারিয়ার সংক্রান্ত লেখা</p>
            </div>
            <Link to="/blog" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              সব আর্টিকেল <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {posts.posts.slice(0, 3).map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all">
                <div className={`aspect-video bg-gradient-to-br ${p.cover_gradient} relative`}>
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
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
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
