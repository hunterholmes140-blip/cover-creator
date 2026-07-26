import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  Star, Users, BookOpen, Facebook, Linkedin, Youtube, Twitter, Github,
  ArrowLeft, Crown, Mail, Phone, MapPin, Globe, Languages, Briefcase,
  GraduationCap, Award, Sparkles, BadgeCheck, Download,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { CourseCard } from "@/components/site/CourseCard";
import { api } from "@/lib/api";
import { toBn } from "@/lib/format";
import { MOCK_TRAINERS } from "@/lib/mock-data";
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
    queryFn: async () => {
      try {
        const res = await api<{ trainer: any; courses: any[] }>("content/trainers.php", { query: { slug } });
        if (res && res.trainer) return res;
      } catch (e) {}

      // Fallback 1: Check localStorage for live trainers
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("live_trainers_v1") || localStorage.getItem("ns.trainers.v1");
          if (raw) {
            const list = JSON.parse(raw);
            const targetSlug = decodeURIComponent(slug).trim().toLowerCase();
            const cleanTarget = targetSlug.replace(/-trainer$/i, "").replace(/^trainer-/i, "");
            const found = list.find((t: any) => {
              if (!t) return false;
              const s = (t.slug || "").trim().toLowerCase();
              const n = (t.name || "").trim().toLowerCase().replace(/\s+/g, "-");
              return (
                s === targetSlug ||
                s === cleanTarget ||
                n === targetSlug ||
                n === cleanTarget ||
                (cleanTarget && s.includes(cleanTarget)) ||
                (cleanTarget && n.includes(cleanTarget))
              );
            });
            if (found) return { trainer: found, courses: [] };
          }
        } catch {}
      }

      // Fallback 2: Check MOCK_TRAINERS list
      const targetSlug = decodeURIComponent(slug).trim().toLowerCase();
      const cleanTarget = targetSlug.replace(/-trainer$/i, "").replace(/^trainer-/i, "");
      const mockFound =
        MOCK_TRAINERS.find((t: any) => {
          if (!t) return false;
          const s = (t.slug || "").trim().toLowerCase();
          const n = (t.name || "").trim().toLowerCase().replace(/\s+/g, "-");
          return (
            s === targetSlug ||
            s === cleanTarget ||
            n === targetSlug ||
            n === cleanTarget ||
            (cleanTarget && s.includes(cleanTarget)) ||
            (cleanTarget && n.includes(cleanTarget))
          );
        }) || MOCK_TRAINERS[0];

      return { trainer: mockFound, courses: [] };
    },
  });

export const Route = createFileRoute("/trainers/$slug")({
  head: ({ loaderData }: { loaderData?: { trainer: any; courses: any[] } }) => ({
    meta: [
      { title: `${loaderData?.trainer?.name ?? "ট্রেনার"} — CV | NextScale Academy` },
      { name: "description", content: loaderData?.trainer?.tagline ?? loaderData?.trainer?.bio?.slice(0, 150) ?? "ট্রেনার প্রোফাইল" },
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

function SectionTitle({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-lg font-bold" style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}>
        {children}
      </h2>
    </div>
  );
}

function TrainerDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(trainerQuery(slug));
  const t = data.trainer;
  if (!t) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">ট্রেনার পাওয়া যায়নি</h1>
          <Link to="/trainers" className="mt-4 inline-flex text-primary hover:underline">সব ট্রেনার দেখুন</Link>
        </div>
      </SiteLayout>
    );
  }
  const isMentor = !!t.is_mentor;
  const trainerImage = t.avatar_url || TRAINER_IMAGES[t.avatar];

  return (
    <SiteLayout>
      {/* Header */}
      <section className={`border-b border-border ${isMentor ? "bg-gradient-to-br from-amber-50 via-orange-50/40 to-background" : "bg-gradient-to-br from-primary/10 via-background to-accent/40"}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/trainers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> সব ট্রেনার
          </Link>
        </div>
      </section>

      {/* CV card */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-2 pb-14">
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* CV header */}
          <div className={`relative px-6 md:px-10 py-8 ${isMentor ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5" : "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent"}`}>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              {/* Avatar */}
              <div className="relative w-[170px] aspect-square shrink-0">
                <div className={`absolute inset-0 rounded-full border-2 border-dashed ${isMentor ? "border-amber-400/60" : "border-primary/40"}`} style={{ transform: "scale(1.08)" }} />
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-60 ${isMentor ? "bg-amber-400/50" : "bg-primary/40"}`} />
                <div className={`absolute inset-0 overflow-hidden rounded-full shadow-xl ring-4 ring-white ${isMentor ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500" : "bg-gradient-to-br from-primary via-primary to-primary/70"}`}>
                  {trainerImage ? (
                    <img
                      src={trainerImage}
                      alt={t.name || "ট্রেনার"}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-white text-5xl font-bold">{(t.name || "ট").charAt(0)}</div>
                  )}
                </div>
                {isMentor && (
                  <div className="absolute -top-1 right-1 z-20 h-9 w-9 rounded-full bg-white shadow-lg ring-2 ring-amber-200 grid place-items-center">
                    <Crown className="h-4 w-4 text-amber-500" />
                  </div>
                )}
              </div>

              {/* Name / title / meta */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}>
                    {t.name}
                  </h1>
                  <BadgeCheck className={`h-6 w-6 ${isMentor ? "text-amber-500" : "text-primary"}`} />
                </div>
                <p className={`mt-1 text-lg font-medium ${isMentor ? "text-amber-600" : "text-primary"}`}>{t.title}</p>
                {t.tagline && <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{t.tagline}</p>}

                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1.5"><Users className="h-3.5 w-3.5 text-primary" /> {toBn(t.students)}+ শিক্ষার্থী</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1.5"><BookOpen className="h-3.5 w-3.5 text-primary" /> {toBn(t.courses)} কোর্স</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1.5 text-amber-600"><Star className="h-3.5 w-3.5 fill-current" /> {t.rating} রেটিং</span>
                </div>

                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                  {t.social?.facebook && <a href={t.social.facebook} className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Facebook className="h-4 w-4" /></a>}
                  {t.social?.linkedin && <a href={t.social.linkedin} className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Linkedin className="h-4 w-4" /></a>}
                  {t.social?.youtube && <a href={t.social.youtube} className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Youtube className="h-4 w-4" /></a>}
                  {t.social?.twitter && <a href={t.social.twitter} className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Twitter className="h-4 w-4" /></a>}
                  {t.social?.github && <a href={t.social.github} className="h-9 w-9 rounded-lg border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Github className="h-4 w-4" /></a>}
                  {t.cv_url ? (
                    <a
                      href={t.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Download className="h-3.5 w-3.5" /> CV ডাউনলোড
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Download className="h-3.5 w-3.5" /> CV ডাউনলোড
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CV body */}
          <div className="grid lg:grid-cols-[280px_1fr] gap-0 border-t border-border">
            {/* Sidebar */}
            <aside className="bg-muted/30 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border space-y-8">
              {/* Contact */}
              <div>
                <SectionTitle icon={Mail}>যোগাযোগ</SectionTitle>
                <ul className="space-y-2.5 text-sm">
                  {t.email && <li className="flex items-start gap-2"><Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span className="break-all">{t.email}</span></li>}
                  {t.phone && <li className="flex items-start gap-2"><Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{t.phone}</span></li>}
                  {t.location && <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{t.location}</span></li>}
                  {t.website && <li className="flex items-start gap-2"><Globe className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{t.website}</span></li>}
                </ul>
              </div>

              {/* Expertise */}
              {t.expertise?.length > 0 && (
                <div>
                  <SectionTitle icon={Sparkles}>এক্সপার্টিজ</SectionTitle>
                  <div className="flex flex-wrap gap-1.5">
                    {t.expertise.map((e: string) => (
                      <span key={e} className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">{e}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {t.languages?.length > 0 && (
                <div>
                  <SectionTitle icon={Languages}>ভাষা</SectionTitle>
                  <ul className="space-y-1.5 text-sm">
                    {t.languages.map((l: string) => (
                      <li key={l} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{l}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications */}
              {t.certifications?.length > 0 && (
                <div>
                  <SectionTitle icon={Award}>সার্টিফিকেশন</SectionTitle>
                  <ul className="space-y-2 text-sm">
                    {t.certifications.map((c: string) => (
                      <li key={c} className="flex items-start gap-2"><BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{c}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>

            {/* Main */}
            <div className="p-6 md:p-10 space-y-10">
              {/* About */}
              <div>
                <SectionTitle icon={Users}>সম্পর্কে</SectionTitle>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{t.bio}</p>
              </div>

              {/* Experience */}
              {t.experience?.length > 0 && (
                <div>
                  <SectionTitle icon={Briefcase}>কর্ম অভিজ্ঞতা</SectionTitle>
                  <ol className="relative border-l-2 border-primary/20 ml-2 space-y-6">
                    {t.experience.map((x: any, i: number) => (
                      <li key={i} className="pl-6 relative">
                        <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-semibold text-base">{x.role}</h3>
                          <span className="text-xs text-muted-foreground">{x.period}</span>
                        </div>
                        <p className={`text-sm font-medium ${isMentor ? "text-amber-600" : "text-primary"}`}>{x.company}</p>
                        {x.description && <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{x.description}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Education */}
              {t.education?.length > 0 && (
                <div>
                  <SectionTitle icon={GraduationCap}>শিক্ষা</SectionTitle>
                  <ol className="relative border-l-2 border-primary/20 ml-2 space-y-6">
                    {t.education.map((x: any, i: number) => (
                      <li key={i} className="pl-6 relative">
                        <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-semibold text-base">{x.degree}</h3>
                          <span className="text-xs text-muted-foreground">{x.period}</span>
                        </div>
                        <p className={`text-sm font-medium ${isMentor ? "text-amber-600" : "text-primary"}`}>{x.school}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Achievements */}
              {t.achievements?.length > 0 && (
                <div>
                  <SectionTitle icon={Award}>অর্জন</SectionTitle>
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {t.achievements.map((a: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-sm">
                        <Sparkles className={`h-4 w-4 mt-0.5 shrink-0 ${isMentor ? "text-amber-500" : "text-primary"}`} />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Courses */}
        {data.courses.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}>এই ট্রেনারের কোর্স</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.courses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
