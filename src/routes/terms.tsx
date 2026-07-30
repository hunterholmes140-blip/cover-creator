import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { useContent } from "@/lib/content-store";
import { DEFAULT_PAGES, PageItem } from "@/routes/admin.pages";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "নিয়ম ও শর্তাবলি — Vencon Academy" },
      { name: "description", content: "ব্যবহারের শর্তাবলী ও নিয়ম।" },
      { property: "og:title", content: "শর্তাবলী" },
      { property: "og:description", content: "Terms & Conditions।" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const [pages] = useContent<PageItem[]>("pages_content", DEFAULT_PAGES);
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : DEFAULT_PAGES;
  const pageData = pageList.find((p) => p.slug === "terms" || p.id === "terms") || DEFAULT_PAGES[2];

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">{pageData.title}</h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">সাইট ব্যবহার করার আগে অনুগ্রহ করে পড়ুন।</p>
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
