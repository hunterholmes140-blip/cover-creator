import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "রিফান্ড পলিসি — NextScale Academy" },
      { name: "description", content: "NextScale Academy-এর কোর্স রিফান্ড ও ক্যান্সেলেশন পলিসি।" },
      { property: "og:title", content: "রিফান্ড পলিসি" },
      { property: "og:description", content: "কোর্স রিফান্ড ও ক্যান্সেলেশন সংক্রান্ত নিয়মাবলী।" },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">রিফান্ড পলিসি</h1>
          <p className="mt-3 text-muted-foreground">সর্বশেষ আপডেট: ২০২৫</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 space-y-6 text-foreground/85 leading-relaxed">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">১. যোগ্যতা</h2>
          <p>কোর্স কেনার ৭ দিনের মধ্যে যদি আপনি সন্তুষ্ট না হন এবং কোর্সের ২০% এর কম কনটেন্ট দেখে থাকেন, তবে আপনি রিফান্ডের জন্য আবেদন করতে পারবেন।</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">২. পদ্ধতি</h2>
          <p>রিফান্ডের জন্য support ইমেইলে আবেদন করুন। রিভিউ শেষে ৭–১০ কর্মদিবসের মধ্যে আপনার পেমেন্ট মেথডে অর্থ ফেরত পাঠানো হবে।</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">৩. ব্যতিক্রম</h2>
          <p>ফ্রি কোর্স, বান্ডেল অফার, এবং লাইভ ওয়ার্কশপ রিফান্ডের আওতাভুক্ত নয়।</p>
        </div>
      </section>
    </SiteLayout>
  );
}
