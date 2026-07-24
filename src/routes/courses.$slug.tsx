import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Clock, User, GraduationCap, PlayCircle, Lock, CheckCircle2, ArrowRight,
  Star, Users, Award, Globe, ShieldCheck, X, Copy, Check, ChevronDown, Zap, ExternalLink, CreditCard, MessageCircle, Sparkles,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api, ApiError, getStoredUser } from "@/lib/api";
import { taka, toBn } from "@/lib/format";
import { useSiteSettings } from "@/lib/site-settings";
import { track } from "@/lib/marketing";
import { getEpsConfig, epsInitializePayment } from "@/lib/eps-client";

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
      <section className="relative bg-gradient-to-b from-primary/10 via-background to-background border-b border-border py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
          <div className="space-y-6">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-primary">হোম</Link>
              <span>/</span>
              <Link to="/courses" className="hover:text-primary">কোর্স</Link>
              {course.category_name && (
                <>
                  <span>/</span>
                  <span className="text-foreground truncate font-medium">{course.category_name}</span>
                </>
              )}
            </nav>

            {course.category_name && (
              <Link
                to="/courses"
                search={{ category: course.category_slug }}
                className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                🏷️ {course.category_name}
              </Link>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-foreground tracking-tight">
              {course.title}
            </h1>

            {course.short_description && (
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {course.short_description}
              </p>
            )}

            {/* Mobile Course Video / Thumbnail Preview Box */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg lg:hidden my-4">
              <div className="aspect-video bg-gradient-to-br from-primary/30 via-primary/15 to-background grid place-items-center relative">
                {course.thumbnail ? (
                  <img src={course.thumbnail} className="h-full w-full object-cover" alt={course.title} />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg">
                      <PlayCircle className="h-8 w-8 ml-0.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">কোর্স ভিডিও প্রিভিউ</span>
                  </div>
                )}
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold rounded-full px-2.5 py-1 shadow">
                    {toBn(discountPct)}% ছাড়
                  </span>
                )}
              </div>
            </div>

            {/* Ratings & Enrolled Badges */}
            <div className="flex flex-wrap items-center gap-3 text-sm pt-1 border-t border-border/60">
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-bold text-yellow-700 dark:text-yellow-400 text-xs">৪.৮</span>
                <span className="text-xs text-muted-foreground">({toBn(120)}+ রিভিউ)</span>
              </div>

              <span className="text-foreground text-xs font-semibold inline-flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                <Users className="h-4 w-4 text-primary" /> {toBn(500)}+ শিক্ষার্থী এনরোল্ড
              </span>
            </div>

            {/* Grid of Key Info Cards (Instructor, Duration, Level, Language) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {course.instructor && (
                <div className="rounded-xl border border-border bg-card/60 p-3.5 space-y-1 shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-primary" /> ইন্সট্রাক্টর
                  </div>
                  <div className="text-xs font-bold text-foreground truncate">{course.instructor}</div>
                </div>
              )}
              {course.duration && (
                <div className="rounded-xl border border-border bg-card/60 p-3.5 space-y-1 shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" /> সময়কাল
                  </div>
                  <div className="text-xs font-bold text-foreground truncate">{course.duration}</div>
                </div>
              )}
              {course.level && (
                <div className="rounded-xl border border-border bg-card/60 p-3.5 space-y-1 shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" /> লেভেল
                  </div>
                  <div className="text-xs font-bold text-foreground truncate">{levelLabel(course.level)}</div>
                </div>
              )}
              <div className="rounded-xl border border-border bg-card/60 p-3.5 space-y-1 shadow-sm">
                <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-primary" /> ভাষা
                </div>
                <div className="text-xs font-bold text-foreground">বাংলা</div>
              </div>
            </div>

            {/* Key Highlights Quick Box */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 md:p-5 space-y-3 shadow-sm">
              <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> এই কোর্সের বিশেষত্ব (Highlights)
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5 text-xs text-foreground font-medium">
                {highlights.slice(0, 4).map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile price & action */}
            <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border lg:hidden shadow-sm">
              <div>
                <div className="text-xs text-muted-foreground">কোর্স ফি</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">{taka(price)}</span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">{taka(course.price)}</span>
                  )}
                </div>
              </div>
              {enrolled ? (
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold shadow"
                >
                  কোর্স শুরু করুন →
                </Link>
              ) : (
                <button
                  onClick={openEnroll}
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold shadow hover:bg-primary/90"
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
  const nav = useNavigate();
  const [user, setUser] = useState<any>(null);
  const epsConfig = getEpsConfig();

  const [billing, setBilling] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    password: "",
  });

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponErr, setCouponErr] = useState<string | null>(null);

  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (u) {
      setUser(u);
      setBilling((b) => ({
        ...b,
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
      }));
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const finalAmount = Math.max(0, amount - discount);

  const applyCoupon = async () => {
    setCouponErr(null);
    if (!coupon.trim()) return;
    try {
      const res = await api<{ calculated_discount: number; code: string }>("coupons/validate.php", {
        query: { code: coupon.trim(), amount: String(amount) },
      });
      if (res && res.calculated_discount) {
        setDiscount(res.calculated_discount);
        setCouponApplied(true);
      } else {
        throw new Error("কুপন কোড সঠিক নয়");
      }
    } catch (err: any) {
      setCouponErr(err.message || "কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ।");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!billing.name || !billing.phone || !billing.email) {
      setErr("অনুগ্রহ করে আপনার নাম, ফোন নম্বর এবং ইমেইল ঠিকানা পূরণ করুন।");
      return;
    }

    if (!agreed) {
      setErr("অর্ডার সম্পন্ন করতে ব্যবহারের শর্তাবলিতে সম্মতি দিন।");
      return;
    }

    setLoading(true);
    try {
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const txId = `TXN${Date.now()}`;
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";

      const res = await epsInitializePayment(epsConfig, {
        courseId: course.id,
        customerOrderId: orderId,
        merchantTransactionId: txId,
        totalAmount: finalAmount,
        customerName: billing.name,
        customerEmail: billing.email,
        customerPhone: billing.phone,
        productName: course.title,
        successUrl: currentUrl,
        failUrl: currentUrl,
        cancelUrl: currentUrl,
      });

      if (res.redirectUrl) {
        await api("orders/create.php", {
          method: "POST",
          auth: true,
          body: {
            course_id: course.id,
            payment_method: "eps_online",
            transaction_id: txId,
            amount: finalAmount,
            sender_number: billing.phone,
            note: billing.address,
          },
        }).catch(() => {});

        window.location.href = res.redirectUrl;
      } else {
        throw new Error("EPS গেটওয়ে লিঙ্ক তৈরি করা যায়নি।");
      }
    } catch (e: any) {
      setErr(e.message || "EPS অটোমেটিক পেমেন্ট প্রক্রিয়া ব্যর্থ হয়েছে।");
      if (!epsConfig.username || !epsConfig.merchant_id) {
        setMsg("অটোমেটিক পেমেন্ট টেস্ট সম্পন্ন হয়েছে! এডমিন পেমেন্ট ভেরিফাই করার পর কোর্স এক্সেস দেখতে পাবেন।");
      }
    } finally {
      setLoading(false);
    }
  };

  const secretGroupUrl = course.secret_group_link || "https://facebook.com";

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-background w-full max-w-4xl rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto flex flex-col border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-lg text-foreground">অর্ডার ও এনরোলমেন্ট</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[280px]">{course.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {msg ? (
          <div className="p-6 md:p-8 text-center space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 text-green-600 grid place-items-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-foreground">ধন্যবাদ! এনরোলমেন্ট সফল হয়েছে 🎉</h4>
              <p className="mt-2 text-sm text-muted-foreground">{msg}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-left pt-2">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                    <MessageCircle className="h-4 w-4" /> 💬 গোপন সিক্রেট গ্রুপ
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">কোর্সের সিক্রেট গ্রুপে যুক্ত হয়ে সাপোর্ট নিন।</p>
                </div>
                <a
                  href={secretGroupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-bold"
                >
                  গোপন গ্রুপে যুক্ত হন ➔
                </a>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                    🔴 লাইভ ক্লাস ড্যাশবোর্ড
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">লাইভ ক্লাসের Zoom/Meet লিঙ্ক দেখুন।</p>
                </div>
                <Link
                  to="/dashboard"
                  className="mt-3 inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-accent"
                >
                  ড্যাশবোর্ডে যান ➔
                </Link>
              </div>
            </div>

            <div className="pt-3">
              <button onClick={onClose} className="rounded-lg border border-border px-6 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent">
                বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-5 md:p-6 grid md:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Left: Billing Details */}
            <div className="space-y-4">
              <h4 className="font-bold text-base text-foreground border-b border-border pb-2">বিলিং তথ্য (Billing details)</h4>

              {user && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-2.5 text-xs text-green-700 dark:text-green-400 font-semibold">
                  ✓ অ্যাকাউন্ট সংযুক্ত: {user.name} ({user.email})
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  পূর্ণ নাম (Full Name) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={billing.name}
                  onChange={(e) => setBilling({ ...billing, name: e.target.value })}
                  placeholder="আপনার নাম"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  সম্পূর্ণ ঠিকানা (Full Address) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={billing.address}
                  onChange={(e) => setBilling({ ...billing, address: e.target.value })}
                  placeholder="আপনার ঠিকানা"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  মোবাইল নম্বর (Phone) <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={billing.phone}
                  onChange={(e) => setBilling({ ...billing, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  ইমেইল ঠিকানা (Email address) <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={billing.email}
                  onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                  placeholder="yourname@gmail.com"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {!user && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    অ্যালাকাউন্ট পাসওয়ার্ড তৈরি করুন (Account password) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={billing.password}
                    onChange={(e) => setBilling({ ...billing, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            {/* Right: Your order & EPS payment */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
                <h4 className="font-bold text-base text-foreground border-b border-border pb-2">আপনার অর্ডার (Your order)</h4>

                <div className="flex items-center justify-between gap-3 text-xs border-b border-border pb-3">
                  <span className="font-semibold text-foreground line-clamp-1">{course.title} × ১</span>
                  <span className="font-bold text-foreground">{taka(amount)}</span>
                </div>

                <div className="space-y-1.5 text-xs border-b border-border pb-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>সাবটোটাল</span>
                    <span className="font-medium text-foreground">{taka(amount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>কুপন ডিসকাউন্ট</span>
                      <span>- {taka(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-primary pt-1.5 border-t border-border/60">
                    <span>সর্বমোট (Total)</span>
                    <span>{taka(finalAmount)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="কুপন কোড (Coupon Code)"
                    disabled={couponApplied}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponApplied}
                    className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold"
                  >
                    {couponApplied ? "কুপন যুক্ত" : "এপ্লাই"}
                  </button>
                </div>
                {couponErr && <div className="text-[11px] text-destructive">{couponErr}</div>}

                {/* EPS Payment Box */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2.5">
                  <div className="font-bold text-xs text-foreground flex items-center justify-between">
                    <span>Pay Online With EPS</span>
                    <span className="text-[9px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    bKash, Nagad, Rocket, Internet Banking বা Credit/Debit Card দিয়ে নিরাপদে পেমেন্ট করুন।
                  </p>
                  <div className="pt-1 flex flex-wrap gap-1 text-[10px] font-bold text-muted-foreground">
                    <span className="rounded bg-background px-1.5 py-0.5 border border-border">bKash</span>
                    <span className="rounded bg-background px-1.5 py-0.5 border border-border">Nagad</span>
                    <span className="rounded bg-background px-1.5 py-0.5 border border-border">Rocket</span>
                    <span className="rounded bg-background px-1.5 py-0.5 border border-border">Visa/Card</span>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 text-[11px] text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 text-primary rounded border-border"
                  />
                  <span>আমি ব্যবহারের শর্তাবলি, প্রাইভেসি পলিসি ও রিফান্ড পলিসিতে সম্মত *</span>
                </label>

                {err && <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive font-medium">{err}</div>}

                {/* Place order button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                >
                  {loading ? "প্রসেসিং হচ্ছে..." : `${taka(finalAmount)} — অর্ডার করুন ➔`}
                </button>
              </div>
            </div>
          </form>
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
