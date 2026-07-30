import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { MOCK_COURSES } from "@/lib/mock-data";
import { PlayCircle } from "lucide-react";
import { useContent } from "@/lib/content-store";
import { DEFAULT_PAGES, PageItem } from "@/routes/admin.pages";

export const Route = createFileRoute("/free-courses")({
  head: () => ({
    meta: [
      { title: "ফ্রি কোর্স — Vencon Academy" },
      { name: "description", content: "সম্পূর্ণ ফ্রি কোর্স — এখনই শেখা শুরু করুন।" },
      { property: "og:title", content: "ফ্রি কোর্স" },
      { property: "og:description", content: "বিনামূল্যে শেখার সুযোগ।" },
    ],
  }),
  component: FreeCoursesPage,
});

function FreeCoursesPage() {
  const [pages] = useContent<PageItem[]>("pages_content", DEFAULT_PAGES);
  const pageList = Array.isArray(pages) && pages.length > 0 ? pages : DEFAULT_PAGES;
  const pageData = pageList.find((p) => p.slug === "free-courses" || p.id === "free-courses") || DEFAULT_PAGES[5];

  const free = MOCK_COURSES.filter((c: any) => Number(c.price) === 0);
  const list = free.length ? free : MOCK_COURSES.slice(0, 3);

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">{pageData.title}</h1>
          <div className="mt-3 text-sm md:text-base text-muted-foreground whitespace-pre-line">
            {pageData.content}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c: any) => (
          <Link
            key={c.slug}
            to="/courses/$slug"
            params={{ slug: c.slug }}
            className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video bg-muted overflow-hidden">
              {c.thumbnail && (
                <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold line-clamp-2">{c.title}</h3>
              <p className="mt-2 text-sm text-primary inline-flex items-center gap-1">
                <PlayCircle className="h-4 w-4" /> ফ্রি এনরোল করুন
              </p>
            </div>
          </Link>
        ))}
      </section>
    </SiteLayout>
  );
}
