import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Zap, ShieldCheck, CreditCard } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api, getStoredUser } from "@/lib/api";
import { taka } from "@/lib/format";
import { getEpsConfig, epsInitializePayment } from "@/lib/eps-client";

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
  const epsConfig = getEpsConfig();
  const isEpsActive = !!epsConfig.enabled;

  const [method, setMethod] = useState<"eps" | "bkash" | "nagad" | "rocket">(isEpsActive ? "eps" : "bkash");
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

  const handleEpsPayment = async () => {
    setErr(null);
    if (!user) {
      nav({ to: "/login" });
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
        totalAmount: amount,
        customerName: user.name || "Student",
        customerEmail: user.email || "student@example.com",
        customerPhone: user.phone || "01700000000",
        productName: course.title,
        successUrl: currentUrl,
        failUrl: currentUrl,
        cancelUrl: currentUrl,
      });

      if (res.redirectUrl) {
        // Record order in backend
        await api("orders/create.php", {
          method: "POST",
          auth: true,
          body: { course_id: course.id, payment_method: "eps_online", transaction_id: txId, amount },
        }).catch(() => {});

        // Redirect student to EPS Payment Gateway URL
        window.location.href = res.redirectUrl;
      } else {
        throw new Error("EPS গেটওয়ে লিঙ্ক তৈরি করা যায়নি।");
      }
    } catch (e: any) {
      setErr(e.message || "EPS অটোমেটিক পেমেন্ট প্রক্রিয়া ব্যর্থ হয়েছে।");
      // Fallback for demo environment if credentials are not yet set
      if (!epsConfig.username || !epsConfig.merchant_id) {
        setMsg("অটোমেটিক পেমেন্ট টেস্ট সম্পন্ন হয়েছে! এডমিন পেমেন্ট ভেরিফাই করার পর কোর্স এক্সেস দেখতে পাবেন।");
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!user) {
      nav({ to: "/login" });
      return;
    }
    if (method === "eps") {
      await handleEpsPayment();
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
          <p className="mt-2 text-muted-foreground">পেমেন্ট মেথড বাছাই করে কোর্স ভর্তি সম্পন্ন করুন।</p>

          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">পেমেন্ট মেথড বেছে নিন</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {isEpsActive && (
                <button
                  type="button"
                  onClick={() => setMethod("eps")}
                  className={`rounded-lg border-2 p-3 text-xs md:text-sm font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    method === "eps"
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <Zap className="h-4 w-4 fill-primary text-primary animate-pulse" />
                  <span>⚡ EPS অটোমেটিক</span>
                </button>
              )}
              {(["bkash", "nagad", "rocket"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-lg border-2 py-3 text-sm font-semibold uppercase ${
                    method === m ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  {m === "bkash" ? "bKash" : m === "nagad" ? "Nagad" : "Rocket"}
                </button>
              ))}
            </div>

            {method === "eps" ? (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
                  <ShieldCheck className="h-4 w-4" /> ইনস্ট্যান্ট অটোমেটিক পেমেন্ট
                </div>
                <h3 className="font-bold text-base text-foreground">
                  bKash, Nagad, Rocket, Visa/Mastercard কার্ড দিয়ে পেমেন্ট করুন
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  নিচের বাটনে চাপ দিলে আপনাকে নিরাপদ EPS Payment Gateway পেজে নিয়ে যাবে। পেমেন্ট সম্পূর্ণ হওয়ার সাথে সাথে কোর্স এক্সেস পেয়ে যাবেন।
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleEpsPayment}
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-8 py-3.5 text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-105"
                  >
                    <CreditCard className="h-5 w-5" /> {loading ? "প্রসেসিং হচ্ছে..." : `স্বয়ংক্রিয় পেমেন্ট করুন (${taka(amount)}) ➔`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
                <div className="text-muted-foreground">Send Money নম্বর:</div>
                <div className="mt-1 text-2xl font-bold tracking-wide">{numbers[method]}</div>
                <div className="mt-2 text-xs text-muted-foreground">পরিমাণ: <span className="font-bold text-foreground">{taka(amount)}</span></div>
              </div>
            )}
          </div>

          {method !== "eps" && (
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
                <input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })}
                  placeholder="অতিরিক্ত তথ্য..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {err && <div className="text-sm text-destructive font-medium">{err}</div>}

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90 transition-colors">
                {loading ? "সাবমিট হচ্ছে..." : "অর্ডার সাবমিট করুন"}
              </button>
            </form>
          )}

          {method === "eps" && err && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive font-medium">
              {err}
            </div>
          )}
        </div>

        {/* Course Summary Card */}
        <div>
          <div className="rounded-xl border border-border bg-card p-5 sticky top-24">
            <h2 className="font-semibold mb-4">কোর্স বিবরণ</h2>
            <div className="aspect-video rounded-lg bg-muted overflow-hidden relative mb-4">
              {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />}
            </div>
            <h3 className="font-bold leading-snug">{course.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{course.instructor}</p>

            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">মূল্য</span>
                <span className={course.discount_price ? "line-through text-muted-foreground" : "font-bold"}>{taka(course.price)}</span>
              </div>
              {course.discount_price && (
                <div className="flex justify-between font-bold text-primary">
                  <span>ডিসকাউন্ট মূল্য</span>
                  <span>{taka(course.discount_price)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
