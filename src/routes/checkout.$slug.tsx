import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api, getStoredUser } from "@/lib/api";
import { taka } from "@/lib/format";

export const Route = createFileRoute("/checkout/$slug")({
  head: () => ({
    meta: [
      { title: "চেকআউট — NextScale" },
      { name: "description", content: "কোর্স এনরোলমেন্ট সম্পন্ন করুন।" },
    ],
  }),
  loader: async ({ params }) => {
    const res = await api<{ course: any }>("courses/detail.php", { query: { slug: params.slug } });
    return res;
  },
  component: CheckoutPage,
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">{error.message}</div></SiteLayout>,
});

function CheckoutPage() {
  const { course } = Route.useLoaderData();
  const nav = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [method, setMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [f, setF] = useState({ sender_number: "", transaction_id: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const amount = course.discount_price ?? course.price;
  const numbers: Record<string, string> = {
    bkash: "01700-000000",
    nagad: "01700-000000",
    rocket: "01700-000000",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!user) {
      nav({ to: "/login" });
      return;
    }
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

  if (msg) {
    const secretGroupUrl = course.secret_group_link || "https://facebook.com";

    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center shadow-xl space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-green-500/10 text-green-600 grid place-items-center ring-8 ring-green-500/5">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-700 px-3 py-1 text-xs font-bold">
                পেমেন্ট সফল ও কনফার্মড
              </span>
              <h1 className="mt-3 text-2xl md:text-4xl font-bold text-foreground">
                ধন্যবাদ! আপনার এনরোলমেন্ট সফল হয়েছে 🎉
              </h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                আপনি <strong className="text-foreground">{course.title}</strong> কোর্সে সফলভাবে যুক্ত হয়েছেন।
              </p>
            </div>

            {/* Quick Action Boxes */}
            <div className="grid sm:grid-cols-2 gap-4 text-left pt-2">
              {/* Box 1: Secret Group */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    💬 প্রাইভেট সিক্রেট গ্রুপ
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    কোর্সের সিক্রেট গ্রুপে যুক্ত হয়ে মেন্টর ও সহপাঠীদের সাথে কানেক্ট হন।
                  </p>
                </div>
                <a
                  href={secretGroupUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold hover:bg-primary/90 transition-colors shadow"
                >
                  গোপন গ্রুপে যুক্ত হন ➔
                </a>
              </div>

              {/* Box 2: Student Dashboard */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    🔴 লাইভ ক্লাস ও ড্যাশবোর্ড
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    আপনার ড্যাশবোর্ড থেকে লাইভ ক্লাসের Zoom/Meet লিঙ্ক ও রেকর্ডিং দেখুন।
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  ড্যাশবোর্ডে যান ➔
                </Link>
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              অর্ডার ট্র্যাকিং আইডি: <code className="bg-muted px-2 py-0.5 rounded font-mono">#ORD-{Date.now().toString().slice(-6)}</code>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">চেকআউট</h1>
          <p className="mt-2 text-muted-foreground">নিচের যেকোনো নম্বরে পেমেন্ট পাঠিয়ে transaction ID সাবমিট করুন।</p>

          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">পেমেন্ট মেথড</h2>
            <div className="grid grid-cols-3 gap-3">
              {(["bkash", "nagad", "rocket"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-lg border-2 py-3 text-sm font-semibold uppercase ${method === m ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"}`}
                >
                  {m === "bkash" ? "bKash" : m === "nagad" ? "Nagad" : "Rocket"}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
              <div className="text-muted-foreground">Send Money নম্বর:</div>
              <div className="mt-1 text-2xl font-bold tracking-wide">{numbers[method]}</div>
              <div className="mt-2 text-xs text-muted-foreground">পরিমাণ: <span className="font-bold text-foreground">{taka(amount)}</span></div>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold">পেমেন্ট তথ্য</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">যে নম্বর থেকে পাঠিয়েছেন</label>
              <input required value={f.sender_number} onChange={(e) => setF({ ...f, sender_number: e.target.value })}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Transaction ID</label>
              <input required value={f.transaction_id} onChange={(e) => setF({ ...f, transaction_id: e.target.value })}
                placeholder="যেমন: 8N7A5B2K1"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">নোট (ঐচ্ছিক)</label>
              <textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            {err && <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{err}</div>}
            {!user && (
              <div className="rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 text-sm p-3">
                অর্ডার সাবমিট করতে আগে <Link to="/login" className="underline font-semibold">লগইন</Link> করুন।
              </div>
            )}
            <button disabled={loading} className="w-full rounded-lg bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 disabled:opacity-60">
              {loading ? "সাবমিট হচ্ছে..." : "অর্ডার সাবমিট করুন"}
            </button>
          </form>
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">অর্ডার সামারি</h3>
            <div className="text-sm font-medium">{course.title}</div>
            {course.instructor && <div className="text-xs text-muted-foreground mt-1">ইন্সট্রাক্টর: {course.instructor}</div>}
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">কোর্স মূল্য</span>
              <span>{taka(course.price)}</span>
            </div>
            {course.discount_price && (
              <div className="flex justify-between text-sm text-green-600">
                <span>ছাড়</span>
                <span>-{taka(course.price - course.discount_price)}</span>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-border flex justify-between font-bold text-lg">
              <span>মোট</span>
              <span className="text-primary">{taka(amount)}</span>
            </div>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
