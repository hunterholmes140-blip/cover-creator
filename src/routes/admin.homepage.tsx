import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useContent } from "@/lib/content-store";
import { HOME_CONTENT_DEFAULTS, CONTENT_KEYS, type HomeContent } from "@/lib/content-defaults";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";
import { RotateCcw, Save } from "lucide-react";

export const Route = createFileRoute("/admin/homepage")({
  component: HomepageAdmin,
});

const GROUPS: { title: string; fields: (keyof HomeContent)[] }[] = [
  { title: "হিরো সেকশন", fields: ["heroBadge","heroTitle","heroTitleAccent","heroSubtitle","heroCta1Label","heroCta1Href","heroCta2Label","heroCta2Href"] },
  { title: "CTA স্ট্রিপ", fields: ["ctaStripText"] },
  { title: "স্ট্যাটস (৪টি সংখ্যা)", fields: ["stat1","stat1Label","stat2","stat2Label","stat3","stat3Label","stat4","stat4Label"] },
  { title: "সেকশন হেডলাইন — ক্যাটেগরি ও কোর্স", fields: ["sectionCategoriesTitle","sectionCategoriesSubtitle","sectionFeaturedTitle","sectionFeaturedSubtitle"] },
  { title: "মেন্টর/ট্রেনার সেকশন", fields: ["sectionMentorEyebrow","sectionMentorTitle","sectionMentorSubtitle"] },
  { title: "টেস্টিমোনিয়াল সেকশন হেডলাইন", fields: ["sectionTestimonialsTitle","sectionTestimonialsSubtitle"] },
  { title: "ব্লগ সেকশন হেডলাইন", fields: ["sectionBlogTitle","sectionBlogSubtitle"] },
  { title: "ভিডিও সেকশন হেডলাইন", fields: ["sectionVideoEyebrow","sectionVideoTitle","sectionVideoSubtitle"] },
  { title: "FAQ সেকশন হেডলাইন", fields: ["sectionFaqTitle","sectionFaqSubtitle"] },
  { title: "নিচের বড় CTA ব্যানার", fields: ["finalCtaTitle","finalCtaSubtitle","finalCtaButton","finalCtaHref"] },
];

const LABELS: Record<keyof HomeContent, string> = {
  heroBadge: "হিরো ব্যাজ", heroTitle: "হিরো টাইটেল", heroTitleAccent: "টাইটেলের অ্যাকসেন্ট (রঙিন)", heroSubtitle: "হিরো সাব-টেক্সট",
  heroCta1Label: "প্রাইমারি বাটন লেবেল", heroCta1Href: "প্রাইমারি বাটন লিঙ্ক",
  heroCta2Label: "সেকেন্ডারি বাটন লেবেল", heroCta2Href: "সেকেন্ডারি বাটন লিঙ্ক",
  ctaStripText: "CTA স্ট্রিপ টেক্সট",
  stat1: "স্ট্যাট ১ (সংখ্যা)", stat1Label: "স্ট্যাট ১ লেবেল",
  stat2: "স্ট্যাট ২ (সংখ্যা)", stat2Label: "স্ট্যাট ২ লেবেল",
  stat3: "স্ট্যাট ৩ (সংখ্যা)", stat3Label: "স্ট্যাট ৩ লেবেল",
  stat4: "স্ট্যাট ৪ (সংখ্যা)", stat4Label: "স্ট্যাট ৪ লেবেল",
  sectionCategoriesTitle: "ক্যাটেগরি — টাইটেল", sectionCategoriesSubtitle: "ক্যাটেগরি — সাবটাইটেল",
  sectionFeaturedTitle: "ফিচার্ড কোর্স — টাইটেল", sectionFeaturedSubtitle: "ফিচার্ড কোর্স — সাবটাইটেল",
  sectionMentorEyebrow: "মেন্টর — উপরের ছোট লেখা", sectionMentorTitle: "মেন্টর — টাইটেল", sectionMentorSubtitle: "মেন্টর — সাবটাইটেল",
  sectionTestimonialsTitle: "টেস্টিমোনিয়াল — টাইটেল", sectionTestimonialsSubtitle: "টেস্টিমোনিয়াল — সাবটাইটেল",
  sectionBlogTitle: "ব্লগ — টাইটেল", sectionBlogSubtitle: "ব্লগ — সাবটাইটেল",
  sectionVideoEyebrow: "ভিডিও — উপরের ছোট লেখা", sectionVideoTitle: "ভিডিও — টাইটেল", sectionVideoSubtitle: "ভিডিও — সাবটাইটেল",
  sectionFaqTitle: "FAQ — টাইটেল", sectionFaqSubtitle: "FAQ — সাবটাইটেল",
  finalCtaTitle: "CTA ব্যানার — টাইটেল", finalCtaSubtitle: "CTA ব্যানার — সাব-টেক্সট",
  finalCtaButton: "CTA ব্যানার — বাটন লেবেল", finalCtaHref: "CTA ব্যানার — বাটন লিঙ্ক",
};

const LONG_FIELDS = new Set<keyof HomeContent>(["heroSubtitle","ctaStripText","sectionMentorSubtitle","sectionTestimonialsSubtitle","sectionVideoSubtitle","finalCtaSubtitle"]);

function HomepageAdmin() {
  const [content, , setAll] = useContent(CONTENT_KEYS.HOME, HOME_CONTENT_DEFAULTS);
  const [form, setForm] = useState<HomeContent>(content);
  const toast = useToast();

  useEffect(() => setForm(content), [content]);

  const set = <K extends keyof HomeContent>(k: K, v: HomeContent[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => { setAll(form); toast.show("হোমপেজ কন্টেন্ট সেভ হয়েছে"); };
  const reset = () => { setAll(HOME_CONTENT_DEFAULTS); setForm(HOME_CONTENT_DEFAULTS); toast.show("ডিফল্টে ফিরানো হয়েছে"); };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="হোমপেজ কন্টেন্ট"
        subtitle="হোমপেজের প্রতিটা সেকশনের টেক্সট, বাটন ও লিঙ্ক এখান থেকে এডিট করুন। লাইভে গেলে সব ভিজিটর সাথে সাথে দেখবে।"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={reset}><RotateCcw className="h-4 w-4" /> ডিফল্ট</Button>
            <Button onClick={save}><Save className="h-4 w-4" /> সেভ করুন</Button>
          </div>
        }
      />
      {GROUPS.map((g) => (
        <Card key={g.title}>
          <h3 className="font-semibold text-base mb-4">{g.title}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {g.fields.map((f) => (
              <Field key={f} label={LABELS[f]}>
                {LONG_FIELDS.has(f) ? (
                  <Textarea rows={3} value={form[f] as string} onChange={(e) => set(f, e.target.value as any)} />
                ) : (
                  <Input value={form[f] as string} onChange={(e) => set(f, e.target.value as any)} />
                )}
              </Field>
            ))}
          </div>
        </Card>
      ))}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save}><Save className="h-4 w-4" /> সেভ করুন</Button>
      </div>
      {toast.node}
    </div>
  );
}
