import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Star, Users, BookOpen, Facebook, Linkedin, Youtube, Crown, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api } from "@/lib/api";
import { toBn } from "@/lib/format";

const trainersQuery = queryOptions({
  queryKey: ["trainers"],
  queryFn: () => api<{ trainers: any[] }>("content/trainers.php"),
});

export const Route = createFileRoute("/trainers")({
  head: () => ({
    meta: [
      { title: "আমাদের ট্রেনার — NextScale Academy" },
      { name: "description", content: "প্রধান মেন্টর ও ইন্ডাস্ট্রি এক্সপার্ট ট্রেনারদের সাথে পরিচিত হোন।" },
      { property: "og:title", content: "ট্রেনার প্রোফাইল — NextScale" },
      { property: "og:description", content: "সেরা মেন্টরদের কাছ থেকে শিখুন।" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trainersQuery),
  component: TrainersPage,
  pendingComponent: () => <SiteLayout><div className="min-h-[60vh]" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">{error.message}</div></SiteLayout>,
});

function TrainersPage() {
  const { data } = useSuspenseQuery(trainersQuery);
  const mentor = data.trainers.find((t) => t.is_mentor) ?? data.trainers[0];
  const others = data.trainers.filter((t) => t.id !== mentor.id);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">আমাদের ট্রেনার</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            প্রধান মেন্টরের নেতৃত্বে ইন্ডাস্ট্রির সেরা এক্সপার্টদের কাছ থেকে শিখুন।
          </p>
        </div>
      </section>

      {/* Mentor Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center gap-2 mb-5">
          <Crown className="h-5 w-5 text-amber-500" />
          <h2 className="text-xl font-bold">প্রধান মেন্টর</h2>
        </div>

        <Link
          to="/trainers/$slug"
          params={{ slug: mentor.slug }}
          className="group block rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/30 p-6 md:p-10 hover:border-primary hover:shadow-xl transition-all"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            <div className="relative shrink-0">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-5xl md:text-6xl font-bold shadow-lg">
                {mentor.name.charAt(0)}
              </div>
              <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-amber-500 grid place-items-center shadow-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-semibold">
                <Crown className="h-3 w-3" /> Head Mentor
              </span>
              <h3 className="mt-3 text-2xl md:text-3xl font-bold">{mentor.name}</h3>
              <p className="mt-1 text-primary font-medium">{mentor.title}</p>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                {mentor.bio}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {toBn(mentor.students)}+ শিক্ষার্থী</span>
                <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {toBn(mentor.courses)} কোর্স</span>
                <span className="inline-flex items-center gap-1.5 text-amber-500"><Star className="h-4 w-4 fill-current" /> {mentor.rating} রেটিং</span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <span className="h-8 w-8 rounded-lg border border-border grid place-items-center"><Facebook className="h-4 w-4" /></span>
                  <span className="h-8 w-8 rounded-lg border border-border grid place-items-center"><Linkedin className="h-4 w-4" /></span>
                  <span className="h-8 w-8 rounded-lg border border-border grid place-items-center"><Youtube className="h-4 w-4" /></span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                  বিস্তারিত প্রোফাইল <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Other Trainers */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-xl font-bold mb-5">আমাদের ট্রেনারবৃন্দ</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {others.map((t) => (
            <Link
              key={t.id}
              to="/trainers/$slug"
              params={{ slug: t.slug }}
              className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-2xl font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.title}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{t.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.expertise.slice(0, 4).map((e: string) => (
                  <span key={e} className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1">{e}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {toBn(t.students)}+</span>
                <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {toBn(t.courses)} কোর্স</span>
                <span className="inline-flex items-center gap-1 text-amber-500 ml-auto"><Star className="h-3.5 w-3.5 fill-current" /> {t.rating}</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                প্রোফাইল দেখুন <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
