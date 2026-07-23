import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Users, DollarSign, Award, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/affiliate")({
  head: () => ({
    meta: [
      { title: "অ্যাফিলিয়েট প্রোগ্রাম — NextScale Academy" },
      { name: "description", content: "আমাদের কোর্স রেফার করে আয় করুন — ৩০% পর্যন্ত কমিশন।" },
      { property: "og:title", content: "অ্যাফিলিয়েট প্রোগ্রাম" },
      { property: "og:description", content: "রেফার করে ঘরে বসে আয়।" },
    ],
  }),
  component: AffiliatePage,
});

function AffiliatePage() {
  const perks = [
    { icon: DollarSign, title: "৩০% কমিশন", desc: "প্রতিটি সফল সেলে আকর্ষণীয় কমিশন।" },
    { icon: Users, title: "রিয়েল-টাইম ড্যাশবোর্ড", desc: "ক্লিক, সাইনআপ, সেল—সব লাইভ দেখুন।" },
    { icon: Award, title: "মাসিক পেআউট", desc: "বিকাশ/ব্যাংকে সরাসরি পেমেন্ট।" },
  ];
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/10 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">অ্যাফিলিয়েট প্রোগ্রাম</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            NextScale এর কোর্স শেয়ার করে ঘরে বসে ইনকাম করুন।
          </p>
          <div className="mt-6">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              এখনই জয়েন করুন <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 grid md:grid-cols-3 gap-6">
        {perks.map((p) => (
          <div key={p.title} className="rounded-xl border border-border bg-card p-6">
            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <p.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold text-lg">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
