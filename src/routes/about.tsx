import { createFileRoute } from "@tanstack/react-router";
import { Target, Heart, Rocket } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useContent } from "@/lib/content-store";
import { DEFAULT_PAGES, PageItem } from "@/routes/admin.pages";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — Vencon Academy" },
      { name: "description", content: "Vencon Academy সম্পর্কে জানুন — আমাদের মিশন, ভিশন এবং টিম।" },
      { property: "og:title", content: "আমাদের সম্পর্কে" },
      { property: "og:description", content: "Vencon Academy-এর গল্প ও মিশন।" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: pages } = useContent<PageItem[]>("pages_content", DEFAULT_PAGES);
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : DEFAULT_PAGES;
  const pageData = pageList.find((p) => p.slug === "about" || p.id === "about") || DEFAULT_PAGES[0];

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">{pageData.title}</h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            বাংলাদেশের অগ্রণী অনলাইন লার্নিং প্ল্যাটফর্ম, যেখানে ইন্ডাস্ট্রি এক্সপার্টরা শেখাচ্ছেন হাজারো শিক্ষার্থীকে।
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 space-y-10">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "আমাদের মিশন", desc: "প্রতিটি বাংলাদেশি তরুণের হাতে বিশ্বমানের শিক্ষা পৌঁছে দেওয়া।" },
            { icon: Rocket, title: "ভিশন", desc: "২০৩০ সালের মধ্যে ১০ লক্ষ শিক্ষার্থীর কর্মজীবন গড়তে সাহায্য করা।" },
            { icon: Heart, title: "মূল্যবোধ", desc: "সততা, মান এবং শিক্ষার্থীর সাফল্য — এগুলোই আমাদের অগ্রাধিকার।" },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-bold border-b border-border pb-3 mb-4">আমাদের বিস্তারিত তথ্য</h2>
          <div className="whitespace-pre-line text-foreground/90 leading-relaxed text-sm md:text-base font-sans">
            {pageData.content}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
