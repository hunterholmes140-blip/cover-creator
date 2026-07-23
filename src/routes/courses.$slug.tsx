import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Clock, User, GraduationCap, PlayCircle, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api, ApiError } from "@/lib/api";
import { taka, toBn } from "@/lib/format";

const detailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["course", slug],
    queryFn: () => api<{ course: any; lessons: any[]; enrolled: boolean }>("courses/detail.php", { query: { slug }, auth: true }),
  });

export const Route = createFileRoute("/courses/$slug")({
  head: ({ loaderData }: { loaderData?: { course: any } }) => ({
    meta: loaderData?.course
      ? [
          { title: `${loaderData.course.title} — NextScale` },
          { name: "description", content: loaderData.course.short_description ?? "" },
          { property: "og:title", content: loaderData.course.title },
          { property: "og:description", content: loaderData.course.short_description ?? "" },
        ]
      : [{ title: "কোর্স — NextScale" }],
  }),
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(detailQuery(params.slug));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) throw notFound();
      throw e;
    }
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl p-16 text-center">
        <h1 className="text-3xl font-bold">কোর্স পাওয়া যায়নি</h1>
        <p className="mt-3 text-muted-foreground">এই কোর্সটি আর available নেই বা লিংক ভুল।</p>
        <Link to="/courses" className="mt-6 inline-flex rounded-lg bg-primary text-primary-foreground px-5 py-2.5 font-semibold">সব কোর্স দেখুন</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">{error.message}</div></SiteLayout>,
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(detailQuery(slug));
  const { course, lessons, enrolled } = data;
  const price = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price && course.discount_price < course.price;

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_360px] gap-10">
          <div>
            {course.category_name && (
              <Link to="/courses" search={{ category: course.category_slug }} className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                {course.category_name}
              </Link>
            )}
            <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">{course.title}</h1>
            {course.short_description && (
              <p className="mt-4 text-lg text-muted-foreground">{course.short_description}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {course.instructor && <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {course.instructor}</span>}
              {course.duration && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.duration}</span>}
              {course.level && <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {levelLabel(course.level)}</span>}
            </div>
          </div>

          {/* PRICE CARD */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary/10 grid place-items-center">
                {course.thumbnail ? <img src={course.thumbnail} className="h-full w-full object-cover" alt="" /> : <PlayCircle className="h-14 w-14 text-primary/70" />}
              </div>
              <div className="p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">{taka(price)}</span>
                  {hasDiscount && <span className="text-lg text-muted-foreground line-through">{taka(course.price)}</span>}
                </div>
                {hasDiscount && (
                  <div className="mt-1 text-xs text-green-600 font-medium">
                    {toBn(Math.round(((course.price - course.discount_price) / course.price) * 100))}% ছাড়!
                  </div>
                )}
                {enrolled ? (
                  <Link to="/dashboard" className="mt-5 block w-full rounded-lg bg-primary text-primary-foreground py-3 font-semibold text-center hover:bg-primary/90">
                    কোর্স শুরু করুন →
                  </Link>
                ) : (
                  <Link
                    to="/checkout/$slug"
                    params={{ slug: course.slug }}
                    className="mt-5 flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90"
                  >
                    এখনই এনরোল করুন <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <ul className="mt-5 space-y-2 text-sm">
                  {["লাইফটাইম access", "সার্টিফিকেট", "মোবাইল ও ডেস্কটপ", "কমিউনিটি সাপোর্ট"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1fr_360px] gap-10">
        <div>
          <h2 className="text-2xl font-bold">কোর্স সম্পর্কে</h2>
          <div className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">{course.description}</div>

          <h2 className="mt-10 text-2xl font-bold">কোর্স কনটেন্ট</h2>
          <p className="mt-1 text-sm text-muted-foreground">{toBn(lessons.length)}টি লেসন</p>
          <div className="mt-4 rounded-xl border border-border overflow-hidden divide-y divide-border">
            {lessons.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">লেসন যোগ করা হয়নি।</div>
            ) : (
              lessons.map((l, i) => (
                <div key={l.id} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50">
                  <span className="text-sm text-muted-foreground w-6">{toBn(i + 1)}</span>
                  {l.is_preview || enrolled ? <PlayCircle className="h-5 w-5 text-primary shrink-0" /> : <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <span className="flex-1 text-sm">{l.title}</span>
                  {l.is_preview ? <span className="text-xs text-primary font-medium">ফ্রি প্রিভিউ</span> : null}
                </div>
              ))
            )}
          </div>
        </div>
        <div />
      </section>
    </SiteLayout>
  );
}

function levelLabel(l: string) {
  return l === "beginner" ? "বিগিনার" : l === "intermediate" ? "মিডিয়াম" : "এডভান্সড";
}
