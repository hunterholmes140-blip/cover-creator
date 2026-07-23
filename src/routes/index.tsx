import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Users, Award, PlayCircle, Sparkles } from "lucide-react";
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
    ]);
  },
  component: HomePage,
  pendingComponent: () => <SiteLayout><div className="min-h-[60vh]" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">ত্রুটি: {error.message}</div></SiteLayout>,
});

function HomePage() {
  const { data: featured } = useSuspenseQuery(featuredQuery);
  const { data: cats } = useSuspenseQuery(categoriesQuery);

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
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-base font-semibold hover:bg-primary/90 transition-colors"
              >
                সব কোর্স দেখুন <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-semibold hover:bg-accent transition-colors"
              >
                আমাদের সম্পর্কে
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                { n: "৫০+", l: "কোর্স" },
                { n: "১০,০০০+", l: "শিক্ষার্থী" },
                { n: "৯৮%", l: "সন্তুষ্টি" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{s.n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
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
