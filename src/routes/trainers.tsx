import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Star, Users, BookOpen } from "lucide-react";
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
      { name: "description", content: "ইন্ডাস্ট্রি এক্সপার্ট ট্রেনারদের সাথে পরিচিত হোন — যারা আপনাকে গড়ে তুলবেন প্রফেশনাল হিসেবে।" },
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
  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">আমাদের ট্রেনার</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            ইন্ডাস্ট্রির সেরা এক্সপার্টদের কাছ থেকে শিখুন — যারা বাস্তব প্রজেক্টে কাজ করেছেন হাজারো ক্লায়েন্টের সাথে।
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.trainers.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/40 transition-all">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-2xl font-bold">
                {t.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.title}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{t.bio}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {t.expertise.map((e: string) => (
                <span key={e} className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1">{e}</span>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {toBn(t.students)}+ শিক্ষার্থী</span>
              <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {toBn(t.courses)} কোর্স</span>
              <span className="inline-flex items-center gap-1 text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /> {t.rating}</span>
            </div>
            <Link to="/trainers/$slug" params={{ slug: t.slug }} className="mt-5 block text-center rounded-lg bg-primary/10 text-primary py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
              প্রোফাইল দেখুন
            </Link>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
