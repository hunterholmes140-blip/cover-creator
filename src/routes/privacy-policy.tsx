import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "প্রাইভেসি পলিসি — NextScale Academy" },
      { name: "description", content: "আপনার তথ্য কীভাবে সংগ্রহ ও ব্যবহার করি তা জানুন।" },
      { property: "og:title", content: "প্রাইভেসি পলিসি" },
      { property: "og:description", content: "গোপনীয়তা নীতি ও তথ্য সুরক্ষা।" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">প্রাইভেসি পলিসি</h1>
          <p className="mt-3 text-muted-foreground">আপনার তথ্যের গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ।</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 space-y-6 text-foreground/85 leading-relaxed">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">১. তথ্য সংগ্রহ</h2>
          <p>রেজিস্ট্রেশন ও পেমেন্টের সময় আমরা আপনার নাম, ইমেইল, ফোন নম্বর সংগ্রহ করি। এই তথ্য কেবল সেবা প্রদানের জন্যই ব্যবহৃত হয়।</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">২. তথ্য ব্যবহার</h2>
          <p>আপনার তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি করা হয় না। কেবল কোর্স ডেলিভারি, সাপোর্ট ও আপডেটের জন্য ব্যবহার করা হয়।</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">৩. কুকিজ</h2>
          <p>ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে আমরা কুকিজ ব্যবহার করি। ব্রাউজার সেটিংস থেকে চাইলে বন্ধ করা যাবে।</p>
        </div>
      </section>
    </SiteLayout>
  );
}
