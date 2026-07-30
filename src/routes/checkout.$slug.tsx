import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Zap, ShieldCheck, Lock, ArrowRight, Tag } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { EpsPaymentCard } from "@/components/site/EpsPaymentCard";
import { api, getStoredUser, setAuth } from "@/lib/api";
import { taka } from "@/lib/format";
import { getEpsConfig, epsInitializePayment } from "@/lib/eps-client";
import { track } from "@/lib/marketing";

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
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-8 text-center text-destructive">{error.message}</div>
    </SiteLayout>
  ),
});

function CheckoutPage() {
  const { course } = Route.useLoaderData();
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

  let rawAmount = Number(course.price || 0);
  let originalPrice: number | null = null;
  const disc = course.discount_price !== null && course.discount_price !== undefined ? Number(course.discount_price) : null;

  if (disc !== null && disc > 0 && disc !== rawAmount) {
    if (disc < rawAmount) {
      rawAmount = disc;
      originalPrice = Number(course.price);
    } else {
      originalPrice = disc;
    }
  }

  const finalAmount = Math.max(0, rawAmount - discount);

  const applyCoupon = async () => {
    setCouponErr(null);
    if (!coupon.trim()) return;
    try {
      const res = await api<{ calculated_discount: number; code: string }>("coupons/validate.php", {
        query: { code: coupon.trim(), amount: String(rawAmount) },
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
      // Auto register/login if user is guest
      if (!getStoredUser()) {
        const userPw = billing.password && billing.password.length >= 6
          ? billing.password
          : (billing.phone && billing.phone.length >= 6 ? billing.phone.slice(-6) : "123456");
        try {
          const regRes = await api<{ user: any; token: string }>("auth/register.php", {
            method: "POST",
            body: {
              name: billing.name && billing.name.trim() ? billing.name.trim() : (billing.email ? billing.email.split("@")[0] : "Student"),
              email: billing.email,
              phone: billing.phone,
              password: userPw,
            },
          });
          if (regRes && regRes.token) {
            setAuth(regRes.token, regRes.user);
            setUser(regRes.user);
          }
        } catch (regErr: any) {
          // If already registered, attempt login
          try {
            const loginRes = await api<{ user: any; token: string }>("auth/login.php", {
              method: "POST",
              body: {
                email: billing.email,
                password: userPw,
              },
            });
            if (loginRes && loginRes.token) {
              setAuth(loginRes.token, loginRes.user);
              setUser(loginRes.user);
            }
          } catch {}
        }
      }

      track("InitiateCheckout", {
        content_ids: [String(course.id)],
        content_name: course.title,
        value: finalAmount,
        currency: "BDT",
        email: billing.email,
        phone: billing.phone,
        name: billing.name,
      });

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
        track("Purchase", {
          content_ids: [String(course.id)],
          content_name: course.title,
          value: finalAmount,
          currency: "BDT",
          email: billing.email,
          phone: billing.phone,
          name: billing.name,
        });

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

            <div className="grid sm:grid-cols-2 gap-4 text-left pt-2">
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
          {/* LEFT COLUMN: Billing details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">বিলিং তথ্য (Billing details)</h1>
              <p className="text-sm text-muted-foreground mt-1">
                আপনার নাম, মোবাইল নম্বর এবং ইমেইল দিয়ে কোর্স অর্ডার সম্পন্ন করুন।
              </p>
            </div>

            {user && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3.5 flex items-center justify-between text-xs text-green-700 dark:text-green-400 font-semibold">
                <span>✓ অ্যাকাউন্ট সংযুক্ত: {user.name} ({user.email})</span>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  পূর্ণ নাম (Full Name) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={billing.name}
                  onChange={(e) => setBilling({ ...billing, name: e.target.value })}
                  placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  সম্পূর্ণ ঠিকানা (Full Address) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={billing.address}
                  onChange={(e) => setBilling({ ...billing, address: e.target.value })}
                  placeholder="আপনার ঠিকানা (যেমন: ধানমন্ডি, ঢাকা)"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  মোবাইল নম্বর (Phone) <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={billing.phone}
                  onChange={(e) => setBilling({ ...billing, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  ইমেইল ঠিকানা (Email address) <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={billing.email}
                  onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                  placeholder="yourname@gmail.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {!user && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    অ্যালাকাউন্ট পাসওয়ার্ড তৈরি করুন (Account password) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={billing.password}
                    onChange={(e) => setBilling({ ...billing, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">অর্ডার করার সাথে সাথে আপনার অ্যাকাউন্ট তৈরি হয়ে যাবে।</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Your order */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-3">আপনার অর্ডার (Your order)</h2>

              {/* Product item */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
                    {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 text-foreground">{course.title}</h3>
                    <div className="text-xs text-muted-foreground mt-0.5">পরিমাণ × ১</div>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="font-bold text-sm text-foreground">{taka(rawAmount)}</div>
                  {originalPrice && originalPrice > rawAmount && (
                    <div className="text-xs text-muted-foreground line-through font-normal">{taka(originalPrice)}</div>
                  )}
                </div>
              </div>

              {/* Subtotal & Total */}
              <div className="space-y-2 text-sm border-b border-border pb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>সাবটোটাল (Subtotal)</span>
                  <span className="font-medium text-foreground">{taka(rawAmount)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span>- {taka(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border/60">
                  <span>সর্বমোট (Total)</span>
                  <span className="text-lg">{taka(finalAmount)}</span>
                </div>
              </div>

              {/* Coupon input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="কুপন কোড (Coupon Code)"
                    disabled={couponApplied}
                    className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponApplied}
                    className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 transition-colors shadow"
                  >
                    {couponApplied ? "কুপন যুক্ত" : "এপ্লাই (Apply)"}
                  </button>
                </div>
                {couponErr && <div className="text-xs text-destructive">{couponErr}</div>}
              </div>

              {/* EPS Payment Method Section */}
              <EpsPaymentCard selected={true} />

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-primary rounded border-border"
                  />
                  <span>
                    আমি ওয়েবসাইট ব্যবহারের <Link to="/terms" className="text-primary underline">শর্তাবলি</Link>, <Link to="/privacy-policy" className="text-primary underline">প্রাইভেসি পলিসি</Link> এবং <Link to="/refund-policy" className="text-primary underline">রিফান্ড পলিসি</Link> পড়ে সম্মতি জানাচ্ছি *
                  </span>
                </label>
              </div>

              {err && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
                  {err}
                </div>
              )}

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary text-primary-foreground py-4 text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? "প্রসেসিং হচ্ছে..." : `${taka(finalAmount)} — অর্ডার করুন ➔`}
              </button>

              <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck className="h-4 w-4 text-green-600" /> ১০০% নিরাপদ এনক্রিপ্টেড পেমেন্ট
              </div>
            </div>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
