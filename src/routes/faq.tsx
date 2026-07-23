import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api } from "@/lib/api";

const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: () => api<{ faqs: { q: string; a: string }[] }>("content/faqs.php"),
});

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "সাধারণ প্রশ্নাবলী (FAQ) — NextScale Academy" },
      { name: "description", content: "কোর্স, পেমেন্ট, সার্টিফিকেট ও access সম্পর্কিত সব সাধারণ প্রশ্নের উত্তর।" },
      { property: "og:title", content: "FAQ — NextScale" },
      { property: "og:description", content: "আপনার প্রশ্নের উত্তর খুঁজুন এখানে।" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(faqsQuery),
  component: FaqPage,
  pendingComponent: () => <SiteLayout><div className="min-h-[60vh]" /></SiteLayout>,
  errorComponent: ({ error }) => <SiteLayout><div className="p-8 text-center text-destructive">{error.message}</div></SiteLayout>,
});

function FaqPage() {
  const { data } = useSuspenseQuery(faqsQuery);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <div className="inline-flex h-12 w-12 rounded-full bg-primary/10 text-primary items-center justify-center mb-4">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold">সাধারণ প্রশ্নাবলী</h1>
          <p className="mt-3 text-muted-foreground">
            আপনার মনে যেসব প্রশ্ন আসতে পারে — তার উত্তর নিচে দেওয়া হলো।
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-3">
        {data.faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-accent/50 transition-colors"
            >
              <span className="font-semibold">{f.q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 pt-1 text-muted-foreground text-sm leading-relaxed border-t border-border">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-xl bg-muted p-6 text-center">
          <h3 className="font-semibold text-lg">আপনার প্রশ্নের উত্তর পাননি?</h3>
          <p className="mt-2 text-sm text-muted-foreground">আমাদের সাথে সরাসরি যোগাযোগ করুন — আমরা দ্রুত সাড়া দেবো।</p>
          <Link to="/contact" className="mt-4 inline-block rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90">
            যোগাযোগ করুন
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
