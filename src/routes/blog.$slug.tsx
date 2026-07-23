import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api } from "@/lib/api";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: () => api<{ post: any }>("content/posts.php", { query: { slug } }),
  });

export const Route = createFileRoute("/blog/$slug")({
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post?.title ?? "আর্টিকেল"} — NextScale ব্লগ` },
      { name: "description", content: loaderData?.post?.excerpt ?? "" },
      { property: "og:title", content: loaderData?.post?.title ?? "" },
      { property: "og:description", content: loaderData?.post?.excerpt ?? "" },
      { property: "og:type", content: "article" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(postQuery(params.slug)),
  component: PostPage,
  pendingComponent: () => <SiteLayout><div className="min-h-[60vh]" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">{error.message}</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-8 text-center">আর্টিকেল পাওয়া যায়নি</div></SiteLayout>,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const p = data.post;

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> সব আর্টিকেল
        </Link>
        <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">{p.category}</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">{p.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><User className="h-4 w-4" /> {p.author}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {p.published_at}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {p.read_time}</span>
        </div>
        <div className={`mt-8 aspect-video rounded-2xl bg-gradient-to-br ${p.cover_gradient}`} />
        <div className="mt-8 text-base leading-relaxed whitespace-pre-line text-foreground/90">{p.content}</div>
      </article>
    </SiteLayout>
  );
}
