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

  const liveUrl = course.live_class_link || "https://zoom.us";
  const groupUrl = course.secret_group_link || "https://facebook.com";
  const routine = course.class_routine || "প্রতি রবি, মঙ্গল, বৃহস্পতি রাত ৯:০০ টা";
  const notice = course.notice || "আজকের ক্লাসের নির্ধারিত টপিক সোর্স কোড ড্রাইভে আপলোড করা হয়েছে।";
  const recordings: any[] = course.recordings && course.recordings.length ? course.recordings : [
    { id: 1, title: "ক্লাস ১: অরিয়েন্টেশন ও কোর্স পরিচিতি", date: "১৫ জুলাই, ২০২৬", url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ" },
    { id: 2, title: "ক্লাস ২: বেসিক সেটআপ ও কনসেপ্ট", date: "১৮ জুলাই, ২০২৬", url: "https://www.youtube.com/watch?v=ScMzIvxBSi4" },
  ];

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
            <MessageCircle className="h-4 w-4 text-blue-500" /> 💬 সিক্রেট গ্রুপ
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

              <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">ক্লাস রুটিন & সময়সূচী</div>
                  <div className="text-sm md:text-base font-bold text-foreground mt-0.5">{routine}</div>
                </div>
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          )}

          {hubTab === "group" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-500/10 text-blue-600 grid place-items-center">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  প্রাইভেট ফেসবুক / হোয়াটসঅ্যাপ সাপোর্ট গ্রুপ
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
                  এই কোর্সের শিক্ষার্থীদের জন্য নির্ধারিত সিক্রেট সাপোর্ট গ্রুপে যুক্ত হোন। এখানে আপনার সব প্রশ্নের উত্তর ও মেন্টর সাপোর্ট পাবেন।
                </p>
                <div>
                  <a
                    href={groupUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 text-sm md:text-base font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                  >
                    গোপন গ্রুপে যুক্ত হন <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {hubTab === "recordings" && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground">বিগত লাইভ ক্লাস রেকর্ডিং ও ফাইল</h4>
              {recordings.map((rec, i) => (
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
              ))}
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

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      nav({ to: "/login" });
      return;
    }
    setUser(u);
    Promise.all([
      api<{ courses: any[] }>("courses/my-courses.php", { auth: true }).catch(() => ({ courses: [] })),
      api<{ orders: any[] }>("orders/my-orders.php", { auth: true }).catch(() => ({ orders: [] })),
    ]).then(([c, o]) => {
      setCourses(c.courses);
      setOrders(o.orders);
      setLoading(false);
    });
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
                  <div key={c.id} className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between hover:shadow-lg hover:border-primary/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-600 px-2.5 py-0.5 text-xs font-bold animate-pulse">
                          ● লাইভ এক্সেস
                        </span>
                        <span className="text-xs text-muted-foreground">{c.instructor}</span>
                      </div>
                      <h3 className="font-bold text-lg leading-snug">{c.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.short_description || "লাইভ ক্লাস, সাপোর্ট গ্রুপ ও রেকর্ডিং সুবিধা।"}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCourse(c)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-xs font-bold shadow hover:bg-primary/90 transition-colors"
                      >
                        <Radio className="h-3.5 w-3.5 text-red-400" /> কোর্স এক্সেস হাব ➔
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
