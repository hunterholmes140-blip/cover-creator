import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Calendar, Clock } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api } from "@/lib/api";

const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => api<{ posts: any[] }>("content/posts.php"),
});

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "ব্লগ ও আর্টিকেল — NextScale Academy" },
      { name: "description", content: "ওয়েব ডেভেলপমেন্ট, ডিজাইন, মার্কেটিং ও ক্যারিয়ার নিয়ে সাম্প্রতিক আর্টিকেল ও গাইড।" },
      { property: "og:title", content: "NextScale ব্লগ" },
      { property: "og:description", content: "শিক্ষামূলক আর্টিকেল ও টিপস।" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: BlogPage,
  pendingComponent: () => <SiteLayout><div className="min-h-[60vh]" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">{error.message}</div></SiteLayout>,
});

function BlogPage() {
  const { data } = useSuspenseQuery(postsQuery);
  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">ব্লগ ও আর্টিকেল</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            শিক্ষা, ক্যারিয়ার ও টেকনোলজি নিয়ে আমাদের সাম্প্রতিক লেখা।
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.posts.map((p) => (
          <Link
            key={p.id}
            to="/blog/$slug"
            params={{ slug: p.slug }}
            className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all"
          >
            <div className={`aspect-video bg-gradient-to-br ${p.cover_gradient} relative overflow-hidden`}>
              {p.cover_image && (
                <img src={p.cover_image} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-xs font-medium">
                {p.category}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.published_at}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.read_time}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </SiteLayout>
  );
}
