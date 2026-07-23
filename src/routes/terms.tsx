import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "শর্তাবলী — NextScale Academy" },
      { name: "description", content: "ব্যবহারের শর্তাবলী ও নিয়ম।" },
      { property: "og:title", content: "শর্তাবলী" },
      { property: "og:description", content: "Terms & Conditions।" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">শর্তাবলী</h1>
          <p className="mt-3 text-muted-foreground">সাইট ব্যবহার করার আগে অনুগ্রহ করে পড়ুন।</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 space-y-6 text-foreground/85 leading-relaxed">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">১. অ্যাকাউন্ট</h2>
          <p>একজন ব্যবহারকারী একটি অ্যাকাউন্ট তৈরি করবেন এবং লগইন তথ্য গোপন রাখবেন।</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">২. কনটেন্ট ব্যবহার</h2>
          <p>আমাদের কোর্স, ভিডিও ও পিডিএফ কনটেন্ট শুধুমাত্র ব্যক্তিগত শেখার জন্য। পুনঃবিতরণ বা বিক্রি সম্পূর্ণ নিষিদ্ধ।</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">৩. দায়বদ্ধতা</h2>
          <p>আমরা সর্বোচ্চ মানের সেবা দেওয়ার চেষ্টা করি, তবে কনটেন্ট ব্যবহারের ফলাফলের জন্য চূড়ান্ত দায়িত্ব ব্যবহারকারীর।</p>
        </div>
      </section>
    </SiteLayout>
  );
}
