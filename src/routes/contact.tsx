import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ — NextScale Academy" },
      { name: "description", content: "যেকোনো প্রশ্নে যোগাযোগ করুন NextScale টিমের সাথে।" },
      { property: "og:title", content: "যোগাযোগ" },
      { property: "og:description", content: "আমাদের সাথে যোগাযোগ করুন।" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">যোগাযোগ</h1>
          <p className="mt-3 text-muted-foreground">যেকোনো প্রশ্ন বা সহযোগিতার জন্য যোগাযোগ করুন</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          {[
            { I: Mail, title: "ইমেইল", value: "info@nextscale.com" },
            { I: Phone, title: "ফোন", value: "+৮৮০ ১৭০০-০০০০০০" },
            { I: MapPin, title: "ঠিকানা", value: "ঢাকা, বাংলাদেশ" },
          ].map((c) => (
            <div key={c.title} className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                <c.I className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
        >
          {sent ? (
            <div className="text-center py-8">
              <div className="text-2xl">✅</div>
              <div className="mt-3 font-semibold">বার্তা পাঠানো হয়েছে</div>
              <div className="text-sm text-muted-foreground mt-1">শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।</div>
            </div>
          ) : (
            <>
              <h2 className="font-semibold text-lg">বার্তা পাঠান</h2>
              <div>
                <label className="text-sm font-medium">নাম</label>
                <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium">ইমেইল</label>
                <input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-sm font-medium">বার্তা</label>
                <textarea required rows={4} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:bg-primary/90">
                বার্তা পাঠান
              </button>
            </>
          )}
        </form>
      </section>
    </SiteLayout>
  );
}
