import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Clock, User, GraduationCap, PlayCircle, Lock, CheckCircle2, ArrowRight,
  Star, Users, Award, Globe, ShieldCheck, X, Copy, Check, ChevronDown,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api, ApiError, getStoredUser } from "@/lib/api";
import { taka, toBn } from "@/lib/format";
import { useSiteSettings } from "@/lib/site-settings";
import { track } from "@/lib/marketing";

const detailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["course", slug],
    queryFn: () =>
      api<{ course: any; lessons: any[]; enrolled: boolean }>("courses/detail.php", {
        query: { slug },
        auth: true,
      }),
  });

export const Route = createFileRoute("/courses/$slug")({
  head: ({ loaderData }: { loaderData?: { course: any } }) => ({
    meta: loaderData?.course
      ? [
          { title: `${loaderData.course.title} — NextScale` },
          { name: "description", content: loaderData.course.short_description ?? "" },
          { property: "og:title", content: loaderData.course.title },
          { property: "og:description", content: loaderData.course.short_description ?? "" },
          ...(loaderData.course.thumbnail
            ? [
                { property: "og:image", content: loaderData.course.thumbnail },
                { name: "twitter:image", content: loaderData.course.thumbnail },
              ]
            : []),
        ]
      : [{ title: "কোর্স — NextScale" }],
  }),
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(detailQuery(params.slug));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) throw notFound();
      throw e;
    }
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl p-16 text-center">
        <h1 className="text-3xl font-bold">কোর্স পাওয়া যায়নি</h1>
        <p className="mt-3 text-muted-foreground">এই কোর্সটি আর available নেই বা লিংক ভুল।</p>
        <Link to="/courses" className="mt-6 inline-flex rounded-lg bg-primary text-primary-foreground px-5 py-2.5 font-semibold">
          সব কোর্স দেখুন
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-8 text-center text-destructive">{error.message}</div>
    </SiteLayout>
  ),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(detailQuery(slug));
  const { course, lessons, enrolled } = data;
  const price = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price && course.discount_price < course.price;
  const discountPct = hasDiscount
    ? Math.round(((course.price - course.discount_price) / course.price) * 100)
    : 0;

  const [showEnroll, setShowEnroll] = useState(false);

  // Facebook Pixel: ViewContent
  useEffect(() => {
    track("ViewContent", {
      content_ids: [String(course.id)],
      content_name: course.title,
      content_type: "product",
      content_category: course.category_name || undefined,
      value: Number(price) || 0,
      currency: "BDT",
    });
  }, [course.id, course.title, course.category_name, price]);

  const openEnroll = () => {
    track("InitiateCheckout", {
      content_ids: [String(course.id)],
      content_name: course.title,
      value: Number(price) || 0,
      currency: "BDT",
      num_items: 1,
    });
    setShowEnroll(true);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const highlights: string[] = course.highlights?.length
    ? course.highlights
    : [
        "ইন্ডাস্ট্রি-স্ট্যান্ডার্ড কারিকুলাম",
        "প্র্যাকটিকাল প্রজেক্ট ও অ্যাসাইনমেন্ট",
        "লাইফটাইম access ও ফ্রি আপডেট",
        "কোর্স শেষে সার্টিফিকেট",
        "মোবাইল ও ডেস্কটপে দেখুন",
        "কমিউনিটি ও মেন্টর সাপোর্ট",
      ];

  const requirements: string[] = course.requirements?.length
    ? course.requirements
    : ["একটি কম্পিউটার / স্মার্টফোন", "ইন্টারনেট সংযোগ", "শেখার আগ্রহ"];

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-primary/5 via-background to-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          <div>
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary">হোম</Link>
              <span>/</span>
              <Link to="/courses" className="hover:text-primary">কোর্স</Link>
              {course.category_name && (
                <>
                  <span>/</span>
                  <span className="text-foreground truncate">{course.category_name}</span>
                </>
              )}
            </nav>

            {course.category_name && (
              <Link
                to="/courses"
                search={{ category: course.category_slug }}
                className="inline-block mt-4 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1"
              >
                {course.category_name}
              </Link>
            )}
            <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {course.title}
            </h1>
            {course.short_description && (
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                {course.short_description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-semibold">৪.৮</span>
                <span className="text-muted-foreground">({toBn(120)}+ রিভিউ)</span>
              </div>
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {toBn(500)}+ শিক্ষার্থী
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {course.instructor && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {course.instructor}
                </span>
              )}
              {course.duration && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {course.duration}
                </span>
              )}
              {course.level && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" /> {levelLabel(course.level)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> বাংলা
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{taka(price)}</span>
                {hasDiscount && (
                  <span className="text-base text-muted-foreground line-through">
                    {taka(course.price)}
                  </span>
                )}
              </div>
              {enrolled ? (
                <Link
                  to="/dashboard"
                  className="ml-auto rounded-lg bg-primary text-primary-foreground px-5 py-2.5 font-semibold"
                >
                  কোর্স শুরু করুন →
                </Link>
              ) : (
                <button
                  onClick={openEnroll}
                  className="ml-auto rounded-lg bg-primary text-primary-foreground px-5 py-2.5 font-semibold"
                >
                  এখনই এনরোল করুন
                </button>
              )}
            </div>
          </div>

          {/* STICKY PURCHASE CARD */}
          <aside className="hidden lg:block lg:sticky lg:top-24 self-start">
            <PurchaseCard
              course={course}
              price={price}
              hasDiscount={!!hasDiscount}
              discountPct={discountPct}
              enrolled={enrolled}
              onEnroll={openEnroll}
            />
          </aside>
        </div>
      </section>

      {/* TAB NAV */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "ওভারভিউ" },
            { id: "curriculum", label: "কারিকুলাম" },
            { id: "instructor", label: "ইন্সট্রাক্টর" },
            { id: "faq", label: "FAQ" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => scrollTo(t.id)}
              className="py-3 text-sm font-medium text-muted-foreground hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors whitespace-nowrap"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="min-w-0">
          {/* WHAT YOU'LL LEARN */}
          <section id="overview" className="scroll-mt-32">
            <h2 className="text-2xl font-bold">এই কোর্সে যা শিখবেন</h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-6">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* DESCRIPTION */}
            {course.description && (
              <>
                <h2 className="mt-10 text-2xl font-bold">কোর্স সম্পর্কে</h2>
                <div className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {course.description}
                </div>
              </>
            )}

            {/* REQUIREMENTS */}
            <h2 className="mt-10 text-2xl font-bold">যা লাগবে</h2>
            <ul className="mt-4 space-y-2">
              {requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CURRICULUM */}
          <section id="curriculum" className="mt-12 scroll-mt-32">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold">কোর্স কনটেন্ট</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {toBn(lessons.length)}টি লেসন
                  {course.duration ? ` • ${course.duration}` : ""}
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-border overflow-hidden divide-y divide-border bg-card">
              {lessons.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  শীঘ্রই লেসনগুলি যুক্ত করা হবে।
                </div>
              ) : (
                lessons.map((l, i) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {toBn(i + 1)}
                    </span>
                    {l.is_preview || enrolled ? (
                      <PlayCircle className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="flex-1 text-sm truncate">{l.title}</span>
                    {l.is_preview && (
                      <span className="text-xs text-primary font-medium bg-primary/10 rounded-full px-2 py-0.5">
                        ফ্রি প্রিভিউ
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* INSTRUCTOR */}
          {course.instructor && (
            <section id="instructor" className="mt-12 scroll-mt-32">
              <h2 className="text-2xl font-bold">আপনার ইন্সট্রাক্টর</h2>
              <div className="mt-5 rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row gap-5">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 grid place-items-center text-2xl font-bold text-primary shrink-0">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{course.instructor}</h3>
                  <p className="text-sm text-muted-foreground">সিনিয়র ইন্সট্রাক্টর, NextScale</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /> ৪.৯ রেটিং</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {toBn(1200)}+ শিক্ষার্থী</span>
                    <span className="inline-flex items-center gap-1"><Award className="h-3.5 w-3.5" /> {toBn(5)}+ বছর অভিজ্ঞতা</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* FAQ */}
          <section id="faq" className="mt-12 scroll-mt-32">
            <h2 className="text-2xl font-bold">সাধারণ প্রশ্ন</h2>
            <div className="mt-5 space-y-3">
              {COURSE_FAQS.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </section>

          {/* MOBILE STICKY CTA SPACING */}
          <div className="h-20 lg:hidden" />
        </div>

        <div className="hidden lg:block" />
      </div>

      {/* MOBILE STICKY CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border p-3 flex items-center gap-3 shadow-2xl">
        <div>
          <div className="text-lg font-bold text-primary leading-none">{taka(price)}</div>
          {hasDiscount && (
            <div className="text-xs text-muted-foreground line-through">{taka(course.price)}</div>
          )}
        </div>
        {enrolled ? (
          <Link
            to="/dashboard"
            className="flex-1 rounded-lg bg-primary text-primary-foreground py-3 font-semibold text-center"
          >
            কোর্স শুরু করুন
          </Link>
        ) : (
          <button
            onClick={openEnroll}
            className="flex-1 rounded-lg bg-primary text-primary-foreground py-3 font-semibold"
          >
            এনরোল করুন
          </button>
        )}
      </div>

      {showEnroll && (
        <EnrollModal course={course} amount={price} onClose={() => setShowEnroll(false)} />
      )}
    </SiteLayout>
  );
}

// ---------------- Purchase Card ----------------
function PurchaseCard({
  course, price, hasDiscount, discountPct, enrolled, onEnroll,
}: {
  course: any; price: number; hasDiscount: boolean; discountPct: number;
  enrolled: boolean; onEnroll: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
      <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary/10 grid place-items-center relative">
        {course.thumbnail ? (
          <img src={course.thumbnail} className="h-full w-full object-cover" alt={course.title} />
        ) : (
          <PlayCircle className="h-14 w-14 text-primary/70" />
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold rounded-full px-2.5 py-1">
            {toBn(discountPct)}% ছাড়
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">{taka(price)}</span>
          {hasDiscount && (
            <span className="text-lg text-muted-foreground line-through">{taka(course.price)}</span>
          )}
        </div>
        {hasDiscount && (
          <div className="mt-1 text-xs text-green-600 font-medium">
            ৳{toBn(course.price - course.discount_price)} সাশ্রয়!
          </div>
        )}

        {enrolled ? (
          <Link
            to="/dashboard"
            className="mt-5 block w-full rounded-lg bg-primary text-primary-foreground py-3 font-semibold text-center hover:bg-primary/90"
          >
            কোর্স শুরু করুন →
          </Link>
        ) : (
          <>
            <button
              onClick={onEnroll}
              className="mt-5 flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 transition-colors"
            >
              এখনই এনরোল করুন <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              <ShieldCheck className="inline h-3.5 w-3.5 mr-1" /> ৭ দিনের মানি-ব্যাক গ্যারান্টি
            </p>
          </>
        )}

        <div className="mt-5 space-y-2.5 text-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            এই কোর্সে থাকছে
          </div>
          {[
            { icon: PlayCircle, text: "সম্পূর্ণ ভিডিও লেসন" },
            { icon: Clock, text: "লাইফটাইম access" },
            { icon: Award, text: "কমপ্লিশন সার্টিফিকেট" },
            { icon: Globe, text: "মোবাইল ও ডেস্কটপ" },
            { icon: Users, text: "কমিউনিটি সাপোর্ট" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-muted-foreground">
              <f.icon className="h-4 w-4 text-primary shrink-0" />
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Enrollment Modal (inline checkout) ----------------
function EnrollModal({ course, amount, onClose }: { course: any; amount: number; onClose: () => void }) {
  const settings = useSiteSettings();
  const nav = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [method, setMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [f, setF] = useState({ sender_number: "", transaction_id: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setUser(getStoredUser()); }, []);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const s: any = (settings as any)?.settings ?? settings;
  const numbers = useMemo<Record<string, string>>(() => ({
    bkash: s?.bkash_number || "01700-000000",
    nagad: s?.nagad_number || "01700-000000",
    rocket: s?.rocket_number || "01700-000000",
  }), [s]);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(numbers[method].replace(/[^0-9]/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!user) { nav({ to: "/login" }); return; }
    setLoading(true);
    try {
      await api("orders/create.php", {
        method: "POST",
        auth: true,
        body: { course_id: course.id, payment_method: method, ...f },
      });
      setMsg("অর্ডার সাবমিট হয়েছে! এডমিন verify করার পর কোর্স access পাবেন।");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-background w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-lg">এনরোলমেন্ট</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[280px]">{course.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {msg ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
            <h4 className="mt-4 text-xl font-bold">ধন্যবাদ!</h4>
            <p className="mt-3 text-muted-foreground">{msg}</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link to="/dashboard" className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 font-semibold">
                ড্যাশবোর্ডে যান
              </Link>
              <button onClick={onClose} className="rounded-lg border border-border px-5 py-2.5 font-semibold">
                বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Steps */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm">
              <div className="font-semibold mb-2">কীভাবে এনরোল করবেন:</div>
              <ol className="space-y-1 text-muted-foreground list-decimal pl-5">
                <li>নিচের পেমেন্ট মেথড থেকে একটি নির্বাচন করুন</li>
                <li>দেওয়া নম্বরে <span className="font-bold text-foreground">{taka(amount)}</span> Send Money করুন</li>
                <li>Transaction ID সহ ফর্ম সাবমিট করুন</li>
              </ol>
            </div>

            {/* Method */}
            <div>
              <div className="text-sm font-semibold mb-2">পেমেন্ট মেথড</div>
              <div className="grid grid-cols-3 gap-2">
                {(["bkash", "nagad", "rocket"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`rounded-lg border-2 py-2.5 text-sm font-semibold uppercase transition-colors ${
                      method === m ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {m === "bkash" ? "bKash" : m === "nagad" ? "Nagad" : "Rocket"}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-muted p-4">
                <div className="text-xs text-muted-foreground">Send Money নম্বর</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="text-xl font-bold tracking-wide">{numbers[method]}</div>
                  <button
                    type="button"
                    onClick={copyNumber}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-3 py-1.5"
                  >
                    {copied ? <><Check className="h-3.5 w-3.5" /> কপি হয়েছে</> : <><Copy className="h-3.5 w-3.5" /> কপি করুন</>}
                  </button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  পরিমাণ: <span className="font-bold text-foreground">{taka(amount)}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">যে নম্বর থেকে পাঠিয়েছেন</label>
                <input required value={f.sender_number} onChange={(e) => setF({ ...f, sender_number: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Transaction ID</label>
                <input required value={f.transaction_id} onChange={(e) => setF({ ...f, transaction_id: e.target.value })}
                  placeholder="যেমন: 8N7A5B2K1"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">নোট (ঐচ্ছিক)</label>
                <textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              {err && <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{err}</div>}
              {!user && (
                <div className="rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 text-sm p-3">
                  অর্ডার সাবমিট করতে আগে <Link to="/login" className="underline font-semibold">লগইন</Link> করুন।
                </div>
              )}
              <button disabled={loading} className="w-full rounded-lg bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 disabled:opacity-60">
                {loading ? "সাবমিট হচ্ছে..." : `${taka(amount)} — অর্ডার সাবমিট করুন`}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                <ShieldCheck className="inline h-3.5 w-3.5 mr-1" /> নিরাপদ পেমেন্ট • ৭ দিনের মানি-ব্যাক গ্যারান্টি
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- FAQ ----------------
const COURSE_FAQS = [
  { q: "কোর্স কিনলে কতদিন access পাবো?", a: "একবার এনরোল করলে লাইফটাইম access পাবেন — যতবার ইচ্ছা দেখতে পারবেন।" },
  { q: "পেমেন্ট করার পর কতক্ষণে access পাবো?", a: "সাধারণত ৫-৩০ মিনিটের মধ্যে এডমিন verify করে access দিয়ে দেয়। সমস্যা হলে সাপোর্টে যোগাযোগ করুন।" },
  { q: "মোবাইল দিয়ে কোর্স দেখা যাবে?", a: "হ্যাঁ — মোবাইল, ট্যাবলেট, ল্যাপটপ যেকোনো ডিভাইস থেকে দেখতে পারবেন।" },
  { q: "সার্টিফিকেট পাবো?", a: "কোর্স সম্পূর্ণ করার পর ডিজিটাল সার্টিফিকেট পাবেন যা LinkedIn-এ share করতে পারবেন।" },
  { q: "রিফান্ড পলিসি কী?", a: "৭ দিনের মধ্যে সন্তুষ্ট না হলে সম্পূর্ণ ফেরত পাবেন — কোনো প্রশ্ন ছাড়াই।" },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-accent/50 transition-colors"
      >
        <span className="font-medium">{q}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}

function levelLabel(l: string) {
  return l === "beginner" ? "বিগিনার" : l === "intermediate" ? "মিডিয়াম" : "এডভান্সড";
}
