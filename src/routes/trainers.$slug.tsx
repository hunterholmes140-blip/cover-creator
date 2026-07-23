import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Star, Users, BookOpen, Facebook, Linkedin, Youtube, ArrowLeft, Crown } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { CourseCard } from "@/components/site/CourseCard";
import { api } from "@/lib/api";
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


const trainerQuery = (slug: string) =>
  queryOptions({
    queryKey: ["trainer", slug],
    queryFn: () => api<{ trainer: any; courses: any[] }>("content/trainers.php", { query: { slug } }),
  });

export const Route = createFileRoute("/trainers/$slug")({
  head: ({ loaderData }: { loaderData?: { trainer: any; courses: any[] } }) => ({
    meta: [
      { title: `${loaderData?.trainer?.name ?? "ট্রেনার"} — NextScale Academy` },
      { name: "description", content: loaderData?.trainer?.bio?.slice(0, 150) ?? "ট্রেনার প্রোফাইল" },
      { property: "og:title", content: loaderData?.trainer?.name ?? "ট্রেনার" },
      { property: "og:description", content: loaderData?.trainer?.title ?? "" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(trainerQuery(params.slug)),
  component: TrainerDetailPage,
  pendingComponent: () => <SiteLayout><div className="min-h-[60vh]" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">{error.message}</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-8 text-center">ট্রেনার পাওয়া যায়নি</div></SiteLayout>,
});

function TrainerDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(trainerQuery(slug));
  const t = data.trainer;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <Link to="/trainers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> সব ট্রেনার
          </Link>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Circle avatar — same style as home */}
            <div className="relative w-[200px] aspect-square shrink-0">
              <div
                className={`absolute inset-0 rounded-full border-2 border-dashed ${
                  t.is_mentor ? "border-amber-400/60" : "border-primary/40"
                }`}
                style={{ transform: "scale(1.08)" }}
              />
              <div
                className={`absolute inset-0 rounded-full blur-2xl opacity-60 ${
                  t.is_mentor ? "bg-amber-400/50" : "bg-primary/40"
                }`}
              />
              <div
                className={`absolute inset-0 overflow-hidden rounded-full shadow-xl ring-4 ring-white ${
                  t.is_mentor
                    ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500"
                    : "bg-gradient-to-br from-primary via-primary to-primary/70"
                }`}
              >
                {TRAINER_IMAGES[t.avatar] ? (
                  <img
                    src={TRAINER_IMAGES[t.avatar]}
                    alt={t.name}
                    className="absolute inset-x-0 bottom-0 mx-auto h-[95%] w-auto object-contain object-bottom"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-white text-6xl font-bold">
                    {t.name.charAt(0)}
                  </div>
                )}
              </div>
              {t.is_mentor && (
                <div className="absolute -top-1 right-1 z-20 h-9 w-9 rounded-full bg-white shadow-lg ring-2 ring-amber-200 grid place-items-center">
                  <Crown className="h-4 w-4 text-amber-500" />
                </div>
              )}
              <div className="absolute -bottom-1 right-1 z-20 inline-flex items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-amber-600 shadow-lg ring-1 ring-amber-100">
                <Star className="h-3 w-3 fill-current" /> {t.rating}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold">{t.name}</h1>
              <p className="mt-1 text-lg text-primary font-medium">{t.title}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {toBn(t.students)}+ শিক্ষার্থী</span>
                <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" /> {toBn(t.courses)} কোর্স</span>
                <span className="inline-flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current" /> {t.rating} রেটিং</span>
              </div>
              <div className="mt-4 flex gap-2">
                <a href={t.social.facebook} className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Facebook className="h-4 w-4" /></a>
                <a href={t.social.linkedin} className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
                <a href={t.social.youtube} className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Youtube className="h-4 w-4" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <h2 className="text-xl font-bold mb-3">সম্পর্কে</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{t.bio}</p>

          {data.courses.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-10 mb-4">এই ট্রেনারের কোর্স</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {data.courses.map((c) => <CourseCard key={c.id} course={c} />)}
              </div>
            </>
          )}
        </div>
        <aside className="rounded-xl border border-border bg-card p-5 h-fit">
          <h3 className="font-semibold mb-3">এক্সপার্টিজ</h3>
          <div className="flex flex-wrap gap-2">
            {t.expertise.map((e: string) => (
              <span key={e} className="text-xs rounded-full bg-primary/10 text-primary px-3 py-1.5 font-medium">{e}</span>
            ))}
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}
