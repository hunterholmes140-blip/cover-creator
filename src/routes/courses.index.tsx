import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/Layout";
import { CourseCard } from "@/components/site/CourseCard";
import { api } from "@/lib/api";

const searchSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
});

const listQuery = (filters: { category?: string; search?: string }) =>
  queryOptions({
    queryKey: ["courses", "list", filters],
    queryFn: () => api<{ courses: any[] }>("courses/list.php", { query: filters as any }),
  });

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => api<{ categories: any[] }>("courses/categories.php"),
});

export const Route = createFileRoute("/courses/")({
  validateSearch: (s) => searchSchema.parse(s),
  loaderDeps: ({ search }) => search,
  head: () => ({
    meta: [
      { title: "সব কোর্স — NextScale Academy" },
      { name: "description", content: "সব প্রফেশনাল কোর্স ব্রাউজ করুন — ওয়েব ডেভেলপমেন্ট, ডিজাইন, মার্কেটিং।" },
      { property: "og:title", content: "সব কোর্স — NextScale" },
      { property: "og:description", content: "আপনার পছন্দের কোর্স খুঁজে নিন।" },
    ],
  }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(listQuery(deps)),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
  },
  component: CoursesPage,
  pendingComponent: () => <SiteLayout><div className="min-h-[60vh]" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">{error.message}</div></SiteLayout>,
});

function CoursesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.search ?? "");
  const { data } = useSuspenseQuery(listQuery(search));
  const { data: cats } = useSuspenseQuery(categoriesQuery);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { ...search, search: q || undefined } });
  };

  return (
    <SiteLayout>
      {/* HEADER & SEARCH */}
      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/30 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">সব কোর্স</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">আপনার পছন্দের প্রফেশনাল কোর্সটি খুঁজে নিন</p>
          
          <form onSubmit={submitSearch} className="mt-6 flex gap-2 max-w-lg w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="কোর্স খুঁজুন..."
                className="w-full rounded-xl border border-border bg-background/90 backdrop-blur pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="flex-shrink-0 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 shadow-md transition-colors"
            >
              খুঁজুন
            </button>
          </form>
        </div>
      </section>

      {/* CATEGORIES & COURSE GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 overflow-hidden sm:overflow-visible">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8 items-start">
          {/* Category Filter Sidebar / Horizontal Mobile Bar */}
          <aside className="w-full overflow-hidden">
            <h3 className="font-bold mb-3 text-xs uppercase tracking-wider text-muted-foreground hidden lg:block">
              ক্যাটেগরি
            </h3>
            <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-3 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link
                to="/courses"
                search={{ ...search, category: undefined }}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  !search.category
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/60 hover:bg-accent text-foreground"
                }`}
              >
                সব কোর্স
              </Link>
              {cats.categories.map((c) => (
                <Link
                  key={c.id}
                  to="/courses"
                  search={{ ...search, category: c.slug }}
                  className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    search.category === c.slug
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/60 hover:bg-accent text-foreground"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </aside>

          {/* Courses Grid */}
          <div className="w-full min-w-0">
            {data.courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 sm:p-12 text-center text-muted-foreground">
                <p className="text-base font-semibold">কোনো কোর্স পাওয়া যায়নি</p>
                <p className="mt-1 text-sm">আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {data.courses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
