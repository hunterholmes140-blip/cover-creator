import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { useContent } from "@/lib/content-store";
import { DEFAULT_PAGES, PageItem } from "@/routes/admin.pages";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "প্রাইভেসি পলিসি — Vencon Academy" },
      { name: "description", content: "আপনার তথ্য কীভাবে সংগ্রহ ও ব্যবহার করি তা জানুন।" },
      { property: "og:title", content: "প্রাইভেসি পলিসি" },
      { property: "og:description", content: "গোপনীয়তা নীতি ও তথ্য সুরক্ষা।" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const [pages] = useContent<PageItem[]>("pages_content", DEFAULT_PAGES);
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : DEFAULT_PAGES;
  const pageData = pageList.find((p) => p.slug === "privacy-policy" || p.id === "privacy-policy") || DEFAULT_PAGES[1];

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">{pageData.title}</h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">আপনার তথ্যের গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ।</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 text-foreground/90 leading-relaxed text-sm md:text-base">
        <div className="whitespace-pre-line space-y-4 font-sans bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          {pageData.content}
        </div>
      </section>
    </SiteLayout>
  );
}
