import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { useContent } from "@/lib/content-store";
import { DEFAULT_PAGES, PageItem } from "@/routes/admin.pages";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "রিফান্ড পলিসি — Vencon Academy" },
      { name: "description", content: "Vencon Academy-এর কোর্স রিফান্ড ও ক্যান্সেলেশন পলিসি।" },
      { property: "og:title", content: "রিফান্ড পলিসি" },
      { property: "og:description", content: "কোর্স রিফান্ড ও ক্যান্সেলেশন সংক্রান্ত নিয়মাবলী।" },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  const [pages] = useContent<PageItem[]>("pages_content", DEFAULT_PAGES);
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : DEFAULT_PAGES;
  const pageData = pageList.find((p) => p.slug === "refund-policy" || p.id === "refund-policy") || DEFAULT_PAGES[3];

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">{pageData.title}</h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">কোর্স রিফান্ড ও ক্যান্সেলেশন সংক্রান্ত নিয়মাবলী</p>
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
