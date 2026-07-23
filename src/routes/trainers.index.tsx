import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Star, Crown, BadgeCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api } from "@/lib/api";
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

const trainersQuery = queryOptions({
  queryKey: ["trainers"],
  queryFn: () => api<{ trainers: any[] }>("content/trainers.php"),
});

export const Route = createFileRoute("/trainers/")({
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

function TrainerCard({ t, mentor: isMentor = false }: { t: any; mentor?: boolean }) {
  const img = t.avatar_url || TRAINER_IMAGES[t.avatar];
  const name = t.name || "ট্রেনার";
  return (
    <Link
      to="/trainers/$slug"
      params={{ slug: String(t.slug || t.id || "trainer") }}
      className="group relative flex flex-col items-center text-center pt-6"
    >
      <div className="relative w-full max-w-[200px] aspect-square">
        <div
          className={`absolute inset-0 rounded-full border-2 border-dashed transition-transform duration-700 group-hover:rotate-45 ${
            isMentor ? "border-amber-400/60" : "border-primary/40"
          }`}
          style={{ transform: "scale(1.08)" }}
        />
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-90 ${
            isMentor ? "bg-amber-400/50" : "bg-primary/40"
          }`}
        />
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
              className="absolute inset-x-0 bottom-0 mx-auto h-[95%] w-auto object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-white text-6xl font-bold">
              {name.charAt(0)}
            </div>
          )}
        </div>
        {isMentor && (
          <div className="absolute -top-1 right-1 z-20 h-9 w-9 rounded-full bg-white shadow-lg ring-2 ring-amber-200 grid place-items-center">
            <Crown className="h-4 w-4 text-amber-500" />
          </div>
        )}
        <div className="absolute -bottom-1 right-1 z-20 inline-flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-amber-600 shadow-lg ring-1 ring-amber-100">
          <Star className="h-3 w-3 fill-current" /> {t.rating ?? 5}
        </div>
      </div>

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
}

function TrainersPage() {
  const { data } = useSuspenseQuery(trainersQuery);
  const trainerList = Array.isArray(data.trainers) ? data.trainers : [];
  const mentor = trainerList.find((t) => t?.is_mentor) ?? trainerList[0];
  const rest = mentor ? trainerList.filter((t) => t?.id !== mentor.id) : [];

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

      <section className="bg-gradient-to-br from-primary/15 via-primary/5 to-accent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          {mentor ? (
            <div className="flex justify-center">
              <div className="w-full max-w-[240px]">
                <TrainerCard t={mentor} mentor />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background/70 p-8 text-center text-sm text-muted-foreground">
              এখনো কোনো ট্রেনার যোগ করা হয়নি।
            </div>
          )}

          {/* Divider */}
          <div className="mt-10 flex items-center justify-center gap-2 opacity-60">
            <span className="h-px w-16 bg-border" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
            <span className="h-px w-16 bg-border" />
          </div>

          {/* Trainer row — 3 aligned with mentor; horizontal scroll if more */}
          {rest.length <= 3 ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {rest.map((t) => <TrainerCard key={t.id} t={t} />)}
            </div>
          ) : (
            <div className="mt-8 max-w-3xl mx-auto overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:thin]">
              <div className="grid grid-flow-col auto-cols-[minmax(0,33.333%)] gap-8 pb-3">
                {rest.map((t) => (
                  <div key={t.id} className="snap-center">
                    <TrainerCard t={t} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
