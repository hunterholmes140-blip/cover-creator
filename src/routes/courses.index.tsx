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
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold">সব কোর্স</h1>
          <p className="mt-2 text-muted-foreground">আপনার পছন্দের কোর্স খুঁজে নিন</p>
          <form onSubmit={submitSearch} className="mt-6 flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="কোর্স খুঁজুন..."
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90">
              খুঁজুন
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[240px_1fr] gap-8">
        <aside>
          <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">ক্যাটেগরি</h3>
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            <Link
              to="/courses"
              search={{ ...search, category: undefined }}
              className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${!search.category ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              সব
            </Link>
            {cats.categories.map((c) => (
              <Link
                key={c.id}
                to="/courses"
                search={{ ...search, category: c.slug }}
                className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${search.category === c.slug ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </aside>

        <div>
          {data.courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              এই ফিল্টারে কোনো কোর্স পাওয়া যায়নি।
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {data.courses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
