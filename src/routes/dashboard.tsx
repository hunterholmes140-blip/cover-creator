import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, ShoppingBag, Clock, CheckCircle2, XCircle, Radio, MessageCircle, PlayCircle, Bell, ExternalLink, X } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api, getStoredUser } from "@/lib/api";
import { taka } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "ড্যাশবোর্ড — NextScale" },
      { name: "description", content: "আপনার কোর্স ও অর্ডার হিস্ট্রি।" },
    ],
  }),
  component: DashboardPage,
});

function EnrolledCourseHubModal({ course, onClose }: { course: any; onClose: () => void }) {
  const [hubTab, setHubTab] = useState<"live" | "group" | "recordings" | "notice">("live");
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const liveUrl = course.live_class_link || "https://zoom.us";
  const routine = course.class_routine && course.class_routine.trim() ? course.class_routine.trim() : null;
  const notice = course.notice || "আজকের ক্লাসের নির্ধারিত টপিক সোর্স কোড ড্রাইভে আপলোড করা হয়েছে।";

  // Parse real recordings (do not show fake mock data if admin hasn't uploaded any)
  let recordings: any[] = [];
  try {
    if (Array.isArray(course.recordings)) {
      recordings = course.recordings;
    } else if (typeof course.recordings === "string" && course.recordings.trim()) {
      recordings = JSON.parse(course.recordings);
    }
  } catch {
    recordings = [];
  }

  // Parse multiple secret groups from secret_group_link (newline/comma separated)
  const rawGroupLinks = String(course.secret_group_link || "").trim();
  const secretGroupItems: { name: string; url: string; type: "facebook" | "whatsapp" | "telegram" | "general" }[] = [];

  if (rawGroupLinks) {
    const lines = rawGroupLinks.split(/\n|,|;/).map((s) => s.trim()).filter(Boolean);
    lines.forEach((line) => {
      let url = line;
      let name = "";
      if (line.includes("http")) {
        const parts = line.split(/(https?:\/\/[^\s]+)/);
        name = parts[0]?.replace(/[:\-]/g, "").trim() || "";
        url = parts[1] || line;
      }
      const lowerUrl = url.toLowerCase();
      const lowerName = name.toLowerCase();

      if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.com") || lowerName.includes("facebook") || lowerName.includes("ফেসবুক")) {
        secretGroupItems.push({ name: name || "ফেসবুক প্রাইভেট সিক্রেট গ্রুপ", url, type: "facebook" });
      } else if (lowerUrl.includes("whatsapp.com") || lowerUrl.includes("wa.me") || lowerName.includes("whatsapp") || lowerName.includes("হোয়াটসঅ্যাপ")) {
        secretGroupItems.push({ name: name || "হোয়াটসঅ্যাপ সিক্রেট সাপোর্ট গ্রুপ", url, type: "whatsapp" });
      } else if (lowerUrl.includes("t.me") || lowerUrl.includes("telegram") || lowerName.includes("telegram") || lowerName.includes("টেলিগ্রাম")) {
        secretGroupItems.push({ name: name || "টেলিগ্রাম সিক্রেট চ্যানেল/গ্রুপ", url, type: "telegram" });
      } else {
        secretGroupItems.push({ name: name || "প্রাইভেট সিক্রেট গ্রুপ", url, type: "general" });
      }
    });
  }

  if (secretGroupItems.length === 0) {
    secretGroupItems.push({ name: "প্রাইভেট সিক্রেট গ্রুপ", url: "https://facebook.com", type: "facebook" });
  }

  // Calculate live class start countdown status
  let isClassLocked = false;
  let remainingMs = 0;

  if (Boolean(course.is_countdown_enabled) && course.countdown_end_date) {
    const targetMs = new Date(course.countdown_end_date).getTime();
    if (!isNaN(targetMs) && targetMs > nowTime) {
      isClassLocked = true;
      remainingMs = targetMs - nowTime;
    }
  }

  const formatCountdown = (ms: number) => {
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);

    return {
      d: String(d).padStart(2, "0"),
      h: String(h).padStart(2, "0"),
      m: String(m).padStart(2, "0"),
      s: String(s).padStart(2, "0"),
    };
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border bg-muted/40 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
              <Radio className="h-3 w-3 text-red-500 animate-pulse" /> এনরোলড স্টুডেন্ট হাব
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mt-1">{course.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">ইন্সট্রাক্টর: {course.instructor}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 4 Tabs */}
        <div className="flex border-b border-border bg-muted/20 px-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setHubTab("live")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              hubTab === "live" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Radio className="h-4 w-4 text-red-500" /> 🔴 লাইভ ক্লাস
          </button>

          <button
            type="button"
            onClick={() => setHubTab("group")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              hubTab === "group" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="h-4 w-4 text-blue-500" /> 💬 সিক্রেট গ্রুপ ({secretGroupItems.length})
          </button>

          <button
            type="button"
            onClick={() => setHubTab("recordings")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              hubTab === "recordings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <PlayCircle className="h-4 w-4 text-emerald-500" /> 📹 রেকর্ডিং ({recordings.length})
          </button>

          <button
            type="button"
            onClick={() => setHubTab("notice")}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              hubTab === "notice" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="h-4 w-4 text-amber-500" /> 📢 নোটিশ বোর্ড
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {hubTab === "live" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 text-red-600 px-3 py-1 text-xs font-bold animate-pulse">
                  ● লাইভ সেশন
                </span>

                {isClassLocked ? (
                  /* Countdown running before class starts */
                  <div className="space-y-4">
                    <h3 className="text-lg md:text-xl font-bold text-foreground">
                      ⏰ লাইভ ক্লাস শুরু হতে বাকি:
                    </h3>
                    {(() => {
                      const t = formatCountdown(remainingMs);
                      return (
                        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold">
                          {Number(t.d) > 0 && (
                            <div className="flex flex-col items-center bg-background border border-border rounded-lg px-3 py-1.5 min-w-[54px] shadow-sm">
                              <span className="text-lg sm:text-xl font-extrabold text-primary leading-none">{t.d}</span>
                              <span className="text-[10px] text-muted-foreground font-normal mt-0.5">দিন</span>
                            </div>
                          )}
                          <div className="flex flex-col items-center bg-background border border-border rounded-lg px-3 py-1.5 min-w-[54px] shadow-sm">
                            <span className="text-lg sm:text-xl font-extrabold text-primary leading-none">{t.h}</span>
                            <span className="text-[10px] text-muted-foreground font-normal mt-0.5">ঘণ্টা</span>
                          </div>
                          <span className="text-primary text-lg font-bold animate-pulse">:</span>
                          <div className="flex flex-col items-center bg-background border border-border rounded-lg px-3 py-1.5 min-w-[54px] shadow-sm">
                            <span className="text-lg sm:text-xl font-extrabold text-primary leading-none">{t.m}</span>
                            <span className="text-[10px] text-muted-foreground font-normal mt-0.5">মিনিট</span>
                          </div>
                          <span className="text-primary text-lg font-bold animate-pulse">:</span>
                          <div className="flex flex-col items-center bg-background border border-border rounded-lg px-3 py-1.5 min-w-[54px] shadow-sm">
                            <span className="text-lg sm:text-xl font-extrabold text-primary leading-none">{t.s}</span>
                            <span className="text-[10px] text-muted-foreground font-normal mt-0.5">সেকেন্ড</span>
                          </div>
                        </div>
                      );
                    })()}
                    <p className="text-xs text-muted-foreground max-w-md mx-auto italic">
                      ক্লাস শুরু হওয়ার নির্ধারিত সময় হলে সরাসরি জুম/মিট ক্লাসে জয়েন করার বাটনটি এখানে সচল হবে।
                    </p>
                  </div>
                ) : (
                  /* Class is active / unlocked */
                  <div className="space-y-4">
                    <h3 className="text-lg md:text-xl font-bold text-foreground">
                      লাইভ ক্লাসে জয়েন করুন
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
                      নিচের বাটনে ক্লিক করে সরাসরি Zoom / Google Meet ক্লাসে যুক্ত হোন।
                    </p>
                    <div>
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 text-base font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105"
                      >
                        <Radio className="h-5 w-5 fill-current animate-ping" /> Join Live Class Now <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {routine && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">ক্লাস রুটিন & সময়সূচী</div>
                    <div className="text-sm md:text-base font-bold text-foreground mt-0.5">{routine}</div>
                  </div>
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
          )}

          {hubTab === "group" && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-muted-foreground">
                এই কোর্সের শিক্ষার্থীদের জন্য নির্ধারিত সিক্রেট সাপোর্ট গ্রুপসমূহে যুক্ত হোন:
              </div>
              <div className="grid gap-3">
                {secretGroupItems.map((grp, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl grid place-items-center font-bold text-white shadow-sm ${
                        grp.type === "facebook"
                          ? "bg-blue-600"
                          : grp.type === "whatsapp"
                          ? "bg-emerald-600"
                          : grp.type === "telegram"
                          ? "bg-sky-500"
                          : "bg-primary"
                      }`}>
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{grp.name}</h4>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">{grp.url}</p>
                      </div>
                    </div>
                    <a
                      href={grp.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-1.5 rounded-xl text-white px-5 py-2.5 text-xs font-bold shadow-md transition-transform hover:scale-105 ${
                        grp.type === "facebook"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : grp.type === "whatsapp"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : grp.type === "telegram"
                          ? "bg-sky-500 hover:bg-sky-600"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      গ্রুপে যুক্ত হন <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hubTab === "recordings" && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground">বিগত লাইভ ক্লাস রেকর্ডিং ও ফাইল</h4>
              {recordings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-2">
                  <PlayCircle className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                  <div className="font-semibold text-sm text-foreground">এখনো কোনো ক্লাস রেকর্ডিং ভিডিও আপলোড করা হয়নি</div>
                  <p className="text-xs text-muted-foreground">মেন্টর লাইভ ক্লাস সম্পন্ন করার পর রেকর্ডিং ভিডিও আপলোড করলে এখানে দেখতে পাবেন।</p>
                </div>
              ) : (
                recordings.map((rec, i) => (
                  <div key={rec.id || i} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                        <PlayCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm">{rec.title}</h5>
                        <span className="text-xs text-muted-foreground">{rec.date}</span>
                      </div>
                    </div>
                    {rec.url ? (
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                      >
                        ভিডিও দেখুন <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">প্রসেসিং হচ্ছে</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {hubTab === "notice" && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Bell className="h-4 w-4" /> মেন্টরের নোটিশ
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{notice}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DashboardPage() {
  const nav = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"courses" | "orders">("courses");
  const [courses, setCourses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [verifyNotice, setVerifyNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      nav({ to: "/login" });
      return;
    }
    setUser(u);

    const loadData = async () => {
      try {
        const [c, o] = await Promise.all([
          api<{ courses: any[] }>("courses/my-courses.php", { auth: true }).catch(() => ({ courses: [] })),
          api<{ orders: any[] }>("orders/my-orders.php", { auth: true }).catch(() => ({ orders: [] })),
        ]);

        const fetchedOrders = o.orders || [];
        const fetchedCourses = c.courses || [];

        // Auto verify any pending EPS order directly with EPS API
        const pendingOrder = fetchedOrders.find((ord: any) => ord.status === "pending" && ord.transaction_id);
        if (pendingOrder) {
          try {
            const vRes = await api<{ verified: boolean; message?: string }>("payment/eps-verify.php", {
              method: "POST",
              body: { transaction_id: pendingOrder.transaction_id, order_id: pendingOrder.id },
            });

            if (vRes?.verified) {
              setVerifyNotice({
                type: "success",
                text: "🎉 পেমেন্ট সফলভাবে ভেরিফাইড হয়েছে! আপনার কোর্স এক্সেস চালু হয়েছে।",
              });
              const [freshC, freshO] = await Promise.all([
                api<{ courses: any[] }>("courses/my-courses.php", { auth: true }).catch(() => ({ courses: [] })),
                api<{ orders: any[] }>("orders/my-orders.php", { auth: true }).catch(() => ({ orders: [] })),
              ]);
              setCourses(freshC.courses || []);
              setOrders(freshO.orders || []);
            } else if (vRes && vRes.verified === false) {
              setVerifyNotice({
                type: "error",
                text: "❌ পেমেন্ট সম্পন্ন হয়নি বা বাতিল করা হয়েছে (Payment Failed / Canceled)।",
              });
              setOrders(fetchedOrders.map((ord: any) => ord.id === pendingOrder.id ? { ...ord, status: "rejected" } : ord));
              setCourses(fetchedCourses);
            } else {
              setCourses(fetchedCourses);
              setOrders(fetchedOrders);
            }
          } catch {
            setCourses(fetchedCourses);
            setOrders(fetchedOrders);
          }
        } else {
          setCourses(fetchedCourses);
          setOrders(fetchedOrders);
        }
      } catch {
        setCourses([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [nav]);

  if (!user) return null;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-sm text-muted-foreground">স্বাগতম</div>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">{user.name}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {verifyNotice && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm font-semibold flex items-center justify-between gap-3 shadow-sm ${
              verifyNotice.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            <span>{verifyNotice.text}</span>
            <button onClick={() => setVerifyNotice(null)} className="text-xs font-bold px-2 py-1 hover:bg-black/10 rounded">
              ✕ বন্ধ করুন
            </button>
          </div>
        )}

        <div className="flex gap-2 border-b border-border">
          <TabBtn active={tab === "courses"} onClick={() => setTab("courses")} icon={BookOpen} label="আমার কোর্স" />
          <TabBtn active={tab === "orders"} onClick={() => setTab("orders")} icon={ShoppingBag} label="অর্ডার হিস্ট্রি" />
        </div>

        <div className="py-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
          ) : tab === "courses" ? (
            courses.length === 0 ? (
              <EmptyState title="কোনো কোর্স নেই" desc="এখনো কোনো কোর্সে ভর্তি হননি।" cta="সব কোর্স দেখুন" href="/courses" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-primary/40 transition-all group">
                    <div>
                      {/* Course Thumbnail Image */}
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        {c.thumbnail ? (
                          <img
                            src={c.thumbnail}
                            alt={c.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-primary/30 flex items-center justify-center font-bold text-muted-foreground text-xs">
                            Vencon Academy
                          </div>
                        )}
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-red-600/90 text-white backdrop-blur-md px-3 py-1 text-xs font-bold shadow-md">
                          <Radio className="h-3 w-3 animate-pulse" /> লাইভ এক্সেস
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="text-xs text-muted-foreground font-medium mb-1">ইন্সট্রাক্টর: {c.instructor}</div>
                        <h3 className="font-bold text-lg leading-snug text-foreground group-hover:text-primary transition-colors">{c.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.short_description || "লাইভ ক্লাস, সাপোর্ট গ্রুপ ও রেকর্ডিং সুবিধা।"}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        type="button"
                        onClick={() => setSelectedCourse(c)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-xs font-bold shadow-md hover:bg-primary/90 transition-all hover:scale-[1.02]"
                      >
                        <Radio className="h-4 w-4 text-red-400" /> কোর্স এক্সেস হাব ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : orders.length === 0 ? (
            <EmptyState title="কোনো অর্ডার নেই" desc="এখনো কোনো কোর্স অর্ডার করেননি।" cta="কোর্স ব্রাউজ করুন" href="/courses" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 pr-4">কোর্স</th>
                    <th className="py-3 pr-4">অ্যামাউন্ট</th>
                    <th className="py-3 pr-4">মেথড</th>
                    <th className="py-3 pr-4">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 pr-4">{o.course_title}</td>
                      <td className="py-3 pr-4">{taka(o.amount)}</td>
                      <td className="py-3 pr-4 uppercase text-xs">{o.payment_method}</td>
                      <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {selectedCourse && (
        <EnrolledCourseHubModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </SiteLayout>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function EmptyState({ title, desc, cta, href }: any) {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <Link to={href} className="mt-4 inline-flex rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold">{cta}</Link>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; l: string; I: any }> = {
    pending: { c: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500", l: "পেন্ডিং", I: Clock },
    approved: { c: "bg-green-500/10 text-green-700 dark:text-green-500", l: "অনুমোদিত", I: CheckCircle2 },
    rejected: { c: "bg-destructive/10 text-destructive", l: "বাতিল", I: XCircle },
  };
  const s = map[status] ?? map.pending;
  const I = s.I;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.c}`}>
      <I className="h-3 w-3" /> {s.l}
    </span>
  );
}
