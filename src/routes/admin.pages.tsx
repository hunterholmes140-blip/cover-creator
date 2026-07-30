import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";
import { useContent } from "@/lib/content-store";

export const Route = createFileRoute("/admin/pages")({
  component: PagesAdmin,
});

export type PageItem = {
  id: string;
  slug: string;
  title: string;
  content: string;
};

export const DEFAULT_PAGES: PageItem[] = [
  {
    id: "about",
    slug: "about",
    title: "আমাদের সম্পর্কে",
    content: `Vencon Academy-তে আপনাকে স্বাগতম।

আমরা বাংলাদেশের অন্যতম আধুনিক অনলাইন লার্নিং প্ল্যাটফর্ম, যেখানে ইন্ডাস্ট্রি এক্সপার্টরা সরাসরি শিক্ষার্থীদের হাতে-কলমে আধুনিক স্কিল শেখাচ্ছেন।

আমাদের মিশন:
প্রতিটি বাংলাদেশি তরুণের হাতে বিশ্বমানের অনলাইন শিক্ষা পৌঁছে দেওয়া।`,
  },
  {
    id: "privacy-policy",
    slug: "privacy-policy",
    title: "প্রাইভেসি পলিসি",
    content: `Vencon-এ আপনাকে স্বাগতম। আপনার ব্যক্তিগত তথ্যের নিরাপত্তা ও গোপনীয়তা রক্ষা করা আমাদের অন্যতম অঙ্গীকার। এই গোপনীয়তা নীতিতে বর্ণনা করা হয়েছে, আমরা কী ধরণের তথ্য সংগ্রহ করি, কীভাবে তা ব্যবহার করি এবং কীভাবে সুরক্ষিত রাখি।

০১. আমরা আপনার নাম, মোবাইল নম্বর, ইমেইল ঠিকানা, ঠিকানা, পেমেন্ট-সংক্রান্ত তথ্য এবং কোর্সে অংশগ্রহণের জন্য প্রয়োজনীয় অন্যান্য তথ্য সংগ্রহ করতে পারি।

০২. সংগৃহীত তথ্য আমরা- কোর্সে ভর্তি ও সেবা প্রদান, শিক্ষার্থীদের সহায়তা ও সাপোর্ট প্রদান, গুরুত্বপূর্ণ নোটিশ, আপডেট ও অফার জানানো, ওয়েবসাইট ও সেবার মান উন্নয়ন এবং প্রয়োজনে আপনার সাথে যোগাযোগ করা ইত্যাদি কাজে ব্যবহার করি।

০৩. আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে আমরা যথাযথ প্রযুক্তিগত ও প্রশাসনিক ব্যবস্থা গ্রহণ করি। তবে ইন্টারনেটের মাধ্যমে তথ্য আদান-প্রদান শতভাগ ঝুঁকিমুক্ত নয়।

০৪. আপনার ব্যক্তিগত তথ্য আপনার অনুমতি ছাড়া কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না, তবে আইনগত বাধ্যবাধকতা বা সেবা প্রদানের প্রয়োজনে প্রয়োজনীয় অংশীদারদের সাথে সীমিত তথ্য শেয়ার করা হতে পারে।`,
  },
  {
    id: "terms",
    slug: "terms",
    title: "নিয়ম ও শর্তাবলি",
    content: `Vencon ওয়েবসাইট ব্যবহারের নিয়মাবলী ও আইনি শর্ত শর্তাবলি নিচে দেওয়া হলো:

১. প্রতিটি শিক্ষার্থী একটিমাত্র নিজস্ব অ্যাকাউন্ট ব্যবহার করবেন এবং অ্যাকাউন্টের লগইন সিকিউরিটি বজায় রাখার দায়িত্ব শিক্ষার্থীর।

২. আমাদের কোর্সের সমস্ত ভিডিও, লাইভ স্ট্রিম, সোর্স কোড ও লেকচার শিট কেবল শিক্ষার্থী নিজের শিক্ষার জন্য ব্যবহার করবেন। কোনোভাবেই কোনো ভিডিও বা মেটেরিয়ালস অনুমতি ছাড়া বাণিজ্যিক উদ্দেশ্যে শেয়ার বা বিক্রি করা নিষিদ্ধ।

৩. যেকোনো নিয়ম লঙ্ঘনের কারণে এডমিন কর্তৃক সদস্যপদ সাময়িক বা স্থায়ীভাবে স্থগিত করার পূর্ণ অধিকার থাকে।`,
  },
  {
    id: "refund-policy",
    slug: "refund-policy",
    title: "রিফান্ড পলিসি",
    content: `Vencon Academy-এর কোর্স রিফান্ড সংক্রান্ত নিয়মাবলী:

১. যেকোনো পেমেন্ট বা ভর্তির পর আপনি যদি সন্তুষ্ট না হন, তবে নির্দিষ্ট শর্ত সাপেক্ষে আমাদের কাছে রিফান্ডের জন্য আবেদন করতে পারবেন।

২. সফল রিফান্ড আবেদনের ক্ষেত্রে আমাদের সাপোর্ট টিম তদন্তপূর্বক ৩ থেকে ৭ কর্মদিবসের মধ্যে পেমেন্ট মেথডের মাধ্যমে অর্থ ফেরত দেবে।

৩. প্রমোশনাল বান্ডেল বা ফ্রি কোর্সে কোনো রিফান্ড প্রযোজ্য নয়।`,
  },
  {
    id: "affiliate",
    slug: "affiliate",
    title: "অ্যাফিলিয়েট প্রোগ্রাম",
    content: `আমাদের প্ল্যাটফর্মের কোর্স আপনার পরিচিতজনদের সাথে শেয়ার করে হ্যান্ডসাম কমিশন উপার্জন করুন।

১. আপনার অ্যাকাউন্ট থেকে ইউনিক রেফারেল লিংক সংগ্রহ করুন।
২. আপনার রেফারেল লিংক ব্যবহার করে কেউ কোর্স এনরোল করলে সাথে সাথে আপনার অ্যাকাউন্টে কমিশন যুক্ত হবে।`,
  },
  {
    id: "free-courses",
    slug: "free-courses",
    title: "ফ্রি কোর্স",
    content: `আমাদের সকল শিক্ষার্থীদের জন্য সম্পূর্ণ ফ্রীতে কিছু প্রিমিয়াম রিসোর্স ও পরিচিতি টিউটোরিয়াল উন্মুক্ত রাখা হয়েছে।

আপনি আমাদের ফ্রী কোর্সে যেকোনো সময় অ্যাকাউন্ট খুলে অংশগ্রহণ করতে পারবেন।`,
  },
];

function PagesAdmin() {
  const { data: items, save } = useContent<PageItem[]>("pages_content", DEFAULT_PAGES);
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string>("privacy-policy");
  const [selected, setSelected] = useState<PageItem | null>(null);

  const pagesList = Array.isArray(items) && items.length > 0 ? items : DEFAULT_PAGES;

  useEffect(() => {
    const found = pagesList.find((p) => p.id === selectedId || p.slug === selectedId);
    if (found) {
      setSelected({ ...found });
    }
  }, [selectedId, items]);

  const handleSave = () => {
    if (!selected) return;

    const nextPages = pagesList.map((p) =>
      p.id === selected.id || p.slug === selected.slug
        ? { ...p, title: selected.title, content: selected.content }
        : p
    );

    save(nextPages);
    toast.show("পেইজের কন্টেন্ট সফলভাবে ডেটাবেজে আপডেট হয়েছে!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="পেইজ কন্টেন্ট সম্পাদনা"
        subtitle="About, Privacy, Terms, Refund, Affiliate, Free Courses — এই পেইজগুলোর টেক্সট ডেটাবেজে সেভ করুন।"
      />

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {pagesList.map((p) => (
              <button
                key={p.id || p.slug}
                type="button"
                onClick={() => setSelectedId(p.id || p.slug)}
                className={`w-full text-left p-3.5 text-xs font-semibold hover:bg-accent transition-colors ${
                  selected?.id === p.id || selected?.slug === p.slug
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "text-foreground/80"
                }`}
              >
                <div>{p.title}</div>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">/{p.slug}</div>
              </button>
            ))}
          </div>
        </Card>

        {selected && (
          <Card className="space-y-5 p-6">
            <Field label="পেইজের টাইটেল (Title)">
              <Input
                value={selected.title}
                onChange={(e) => setSelected({ ...selected, title: e.target.value })}
              />
            </Field>

            <Field label="Slug (URL)">
              <Input value={selected.slug} disabled className="bg-muted text-muted-foreground font-mono text-xs" />
            </Field>

            <Field label="কন্টেন্ট (Page Text Content)" hint="এখানে যা লিখবেন তা লাইভ ওয়েবসাইট পেইজে অটোমেটিক আপডেট হয়ে দেখাবে">
              <Textarea
                rows={16}
                value={selected.content}
                onChange={(e) => setSelected({ ...selected, content: e.target.value })}
                className="font-sans leading-relaxed text-sm"
              />
            </Field>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button type="button" onClick={handleSave} className="px-6 py-2.5 font-bold shadow-md">
                সেভ করুন (Save to Live Site)
              </Button>
            </div>
          </Card>
        )}
      </div>

      {toast.node}
    </div>
  );
}
