// শেয়ার্ড কোর্স ফর্ম — new এবং edit উভয় পেজে ব্যবহার হয়।
import { useState } from "react";
import { makeSlug } from "@/lib/admin-store";
import { useLiveCategories } from "@/lib/live-store";
import { useTrainers } from "@/lib/admin-store";
import { MOCK_TRAINERS } from "@/lib/mock-data";
import { BADGE_PRESETS, BADGE_STYLES, type BadgeVariant } from "@/lib/course-badges";
import { Field, Input, Textarea, Select, Button } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";

function InstructorMultiSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const { items: trainers } = useTrainers();
  const trainerList = trainers && trainers.length > 0 ? trainers : MOCK_TRAINERS;

  const selectedNames = (value || "")
    .split(/,| and | এবং /i)
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleTrainer = (name: string) => {
    let next: string[];
    if (selectedNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
      next = selectedNames.filter((n) => n.toLowerCase() !== name.toLowerCase());
    } else {
      next = [...selectedNames, name];
    }
    onChange(next.join(", "));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="text-xs font-semibold text-foreground mb-2">
          ড্রপ ডাউন তালিকা থেকে মেন্টর/ট্রেনার নির্বাচন করুন (একাধিক নির্বাচন করা যাবে):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {trainerList.map((t: any) => {
            const isSelected = selectedNames.some((n) => n.toLowerCase() === (t.name || "").toLowerCase());
            return (
              <label
                key={t.id || t.slug || t.name}
                className={`flex items-center gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 font-bold text-primary shadow-sm"
                    : "border-border hover:bg-muted/50 text-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleTrainer(t.name)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 shrink-0"
                />
                <span className="truncate">{t.name} {t.title ? `(${t.title})` : ""}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1">
          ম্যানুয়াল ইনপুট (কমা দিয়ে নামগুলো সেপারেট করতে পারবেন):
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="যেমন: Faruk Hossain, Sakibul Islam, Farazul Islam"
        />
      </div>

      {selectedNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-medium text-muted-foreground">সিলেক্টেড ইনস্ট্রাক্টর ({selectedNames.length} জন):</span>
          {selectedNames.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary border border-primary/25 px-2.5 py-0.5 text-xs font-bold"
            >
              {name}
              <button
                type="button"
                onClick={() => toggleTrainer(name)}
                className="hover:text-destructive text-primary/70 font-black ml-1 text-sm leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


export type RecordingItem = {
  id: string | number;
  title: string;
  date: string;
  url: string;
};

export type CourseModule = {
  id: string | number;
  module_no?: string; // e.g. "Module-01"
  title: string; // e.g. "Foundation-Digital Marketing And AI Basics"
  topics: string[]; // list of topics under this module
};

export type CourseFormValue = {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  thumbnail: string;
  preview_video: string;
  price: number;
  discount_price: number | null;
  category_id: number | null;
  category_name: string;
  category_slug: string;
  instructor: string;
  duration: string;
  live_class_link?: string;
  secret_group_link?: string;
  class_routine?: string;
  notice?: string;
  recordings?: RecordingItem[];
  modules?: CourseModule[];
  level: "beginner" | "intermediate" | "advanced";
  is_published: 0 | 1;
  is_featured: 0 | 1;
  badge: { text: string; variant: BadgeVariant } | null;
  lessons: any[];
  is_countdown_enabled?: boolean | number;
  countdown_title?: string;
  countdown_end_date?: string;
};

export const emptyCourse: CourseFormValue = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  thumbnail: "",
  preview_video: "",
  price: 0,
  discount_price: null,
  category_id: null,
  category_name: "",
  category_slug: "",
  instructor: "",
  duration: "",
  live_class_link: "",
  secret_group_link: "",
  class_routine: "প্রতি রবি, মঙ্গল, বৃহস্পতি রাত ৯:০০ টা",
  notice: "",
  recordings: [],
  modules: [],
  level: "beginner",
  is_published: 1,
  is_featured: 0,
  badge: null,
  lessons: [],
  is_countdown_enabled: false,
  countdown_title: "⚡ অফার শেষ হতে বাকি:",
  countdown_end_date: "",
};

export function CourseForm({
  initial,
  onSubmit,
  submitLabel = "সেভ করুন",
}: {
  initial: CourseFormValue;
  onSubmit: (v: CourseFormValue) => void;
  submitLabel?: string;
}) {
  const { items: categories } = useLiveCategories();
  const [v, setV] = useState<CourseFormValue>(initial);
  const set = <K extends keyof CourseFormValue>(k: K, val: CourseFormValue[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const setCategory = (id: string) => {
    const cat = categories.find((c: any) => String(c.id) === id);
    if (cat) {
      set("category_id", cat.id);
      set("category_name", cat.name);
      set("category_slug", cat.slug);
    } else {
      set("category_id", null);
      set("category_name", "");
      set("category_slug", "");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = v.slug.trim() || makeSlug(v.title);
    onSubmit({ ...v, slug: finalSlug });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">মূল তথ্য</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="কোর্স টাইটেল" required>
            <Input value={v.title} onChange={(e) => set("title", e.target.value)} required />
          </Field>
          <Field label="Slug" hint="URL-এ ব্যবহৃত। খালি রাখলে অটো তৈরি হবে।">
            <Input value={v.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="সংক্ষিপ্ত বিবরণ">
            <Input value={v.short_description} onChange={(e) => set("short_description", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="ইনস্ট্রাক্টর নির্বাচন (ড্রপ ডাউন)">
              <InstructorMultiSelect value={v.instructor} onChange={(val) => set("instructor", val)} />
            </Field>
          </div>
          <Field label="বিস্তারিত বিবরণ">
            <Textarea rows={5} value={v.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Thumbnail">
            <ImageUpload value={v.thumbnail} onChange={(url) => set("thumbnail", url)} />
          </Field>

        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">মূল্য ও ক্যাটাগরি</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="দাম (৳)" required>
            <Input type="number" min={0} value={v.price} onChange={(e) => set("price", Number(e.target.value))} />
          </Field>
          <Field label="ছাড়ের দাম (৳)" hint="ছাড় না থাকলে খালি রাখুন">
            <Input
              type="number"
              min={0}
              value={v.discount_price ?? ""}
              onChange={(e) => set("discount_price", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="ক্যাটাগরি">
            <Select value={String(v.category_id ?? "")} onChange={(e) => setCategory(e.target.value)}>
              <option value="">— বাছাই করুন —</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="সময়কাল">
            <Input value={v.duration} onChange={(e) => set("duration", e.target.value)} placeholder="৫০ ঘণ্টা" />
          </Field>
          <Field label="লেভেল">
            <Select value={v.level} onChange={(e) => set("level", e.target.value as any)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </Field>
          <Field label="প্রিভিউ ভিডিও URL">
            <Input value={v.preview_video} onChange={(e) => set("preview_video", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
              ⏰ কাউন্টডাউন টাইমার সেটিংস (Countdown Timer)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              অন করলে কোর্সের ভেতরে একদম উপরে টাইমার কাউন্টডাউন শো হবে
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg text-primary self-start sm:self-auto hover:bg-primary/20 transition-colors">
            <input
              type="checkbox"
              checked={!!v.is_countdown_enabled}
              onChange={(e) => set("is_countdown_enabled", e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            কোর্সে কাউন্টডাউন চালু করুন
          </label>
        </div>

        {v.is_countdown_enabled ? (
          <div className="grid gap-4 md:grid-cols-2 pt-1">
            <Field label="টাইটেল / নোটিশ হেডিং" hint="যেমন: ⚡ বিশেষ অফার শেষ হতে বাকি:">
              <Input
                value={v.countdown_title || ""}
                onChange={(e) => set("countdown_title", e.target.value)}
                placeholder="⚡ অফার শেষ হতে বাকি:"
              />
            </Field>
            <Field label="শেষ হওয়ার তারিখ ও সময়" hint="টাইমারটি যে তারিখ ও সময় পর্যন্ত কাউন্টডাউন করবে">
              <Input
                type="datetime-local"
                value={v.countdown_end_date ? v.countdown_end_date.slice(0, 16) : ""}
                onChange={(e) => set("countdown_end_date", e.target.value)}
              />
            </Field>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic">
            কাউন্টডাউন টাইমারটি বর্তমানে বন্ধ রয়েছে। চালু করতে ডানপাশের চেক বক্সে টিক দিন।
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          🔴 লাইভ ক্লাস ও সিক্রেট গ্রুপ সেটআপ (Live Class & Secret Group Setup)
        </h3>
        <p className="text-xs text-muted-foreground">
          পেমেন্ট বা এনরোল করার পর এই তথ্যগুলো শুধুমাত্র এই কোর্সে এনরোলড শিক্ষার্থীরা দেখতে পাবে।
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Zoom / Meet লাইভ ক্লাস লিংক" hint="যেমন: https://zoom.us/j/123456789">
            <Input
              value={v.live_class_link || ""}
              onChange={(e) => set("live_class_link", e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
          </Field>

          <Field label="প্রাইভেট সিক্রেট গ্রুপ লিংক (একাধিক লিংক দিতে পারেন)" hint="একাধিক লিংক দিতে প্রতি লাইনে ১টি লিংক বা নামসহ লিখুন (যেমন: ফেসবুক গ্রুপ: https://facebook.com/... \n হোয়াটসঅ্যাপ: https://chat.whatsapp.com/...)">
            <Textarea
              rows={3}
              value={v.secret_group_link || ""}
              onChange={(e) => set("secret_group_link", e.target.value)}
              placeholder="ফেসবুক গ্রুপ: https://facebook.com/groups/... &#10;হোয়াটসঅ্যাপ: https://chat.whatsapp.com/..."
            />
          </Field>

          <Field label="ক্লাসের সময়সূচী / রুটিন" hint="যেমন: প্রতি রবি, মঙ্গল, বৃহস্পতি রাত ৯:০০ টা">
            <Input
              value={v.class_routine || ""}
              onChange={(e) => set("class_routine", e.target.value)}
              placeholder="প্রতি রবি, মঙ্গল, বৃহস্পতি রাত ৯:০০ টা"
            />
          </Field>

          <Field label="শিক্ষার্থীদের জন্য জরুরি নোটিশ">
            <Input
              value={v.notice || ""}
              onChange={(e) => set("notice", e.target.value)}
              placeholder="আগামীকালের ক্লাস রাত ৯:৩০ টায় শুরু হবে..."
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            📹 ক্লাস রেকর্ডিং ও ফাইলস ({(v.recordings || []).length})
          </h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const recs = v.recordings || [];
              set("recordings", [
                ...recs,
                { id: Date.now(), title: `ক্লাস ${recs.length + 1} রেকর্ডিং`, date: new Date().toLocaleDateString("bn-BD"), url: "" },
              ]);
            }}
          >
            + রেকর্ডিং যোগ
          </Button>
        </div>
        {(v.recordings || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">এখনো কোনো ক্লাস রেকর্ডিং যোগ করা হয়নি।</p>
        ) : (
          <div className="space-y-3">
            {(v.recordings || []).map((rec, idx) => (
              <div key={rec.id} className="grid gap-2 md:grid-cols-[1fr_140px_1fr_auto] items-center rounded-md border border-border p-3 bg-muted/20">
                <Input
                  value={rec.title}
                  onChange={(e) => {
                    const next = [...(v.recordings || [])];
                    next[idx] = { ...rec, title: e.target.value };
                    set("recordings", next);
                  }}
                  placeholder="ক্লাস ১: এইচটিএমএল বেসিকস"
                />
                <Input
                  value={rec.date}
                  onChange={(e) => {
                    const next = [...(v.recordings || [])];
                    next[idx] = { ...rec, date: e.target.value };
                    set("recordings", next);
                  }}
                  placeholder="তারিখ (যেমন: ২৫ জুলাই)"
                />
                <Input
                  value={rec.url}
                  onChange={(e) => {
                    const next = [...(v.recordings || [])];
                    next[idx] = { ...rec, url: e.target.value };
                    set("recordings", next);
                  }}
                  placeholder="Drive/YouTube/Vimeo লিঙ্ক"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const next = (v.recordings || []).filter((_, i) => i !== idx);
                    set("recordings", next);
                  }}
                >
                  মুছুন
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">স্ট্যাটাস ও ব্যাজ</h3>
        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!v.is_published}
              onChange={(e) => set("is_published", e.target.checked ? 1 : 0)}
            />
            Publish (সাইটে দেখা যাবে)
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!v.is_featured}
              onChange={(e) => set("is_featured", e.target.checked ? 1 : 0)}
            />
            Featured (হোমপেজে দেখাবে)
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <Field label="ব্যাজ ভ্যারিয়েন্ট">
            <Select
              value={v.badge?.variant ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return set("badge", null);
                const preset = BADGE_PRESETS.find((p) => p.variant === val)!;
                set("badge", { variant: val as BadgeVariant, text: v.badge?.text || preset.text });
              }}
            >
              <option value="">— ব্যাজ নেই —</option>
              {BADGE_PRESETS.map((p) => (
                <option key={p.variant} value={p.variant}>
                  {p.text}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ব্যাজ টেক্সট">
            <Input
              value={v.badge?.text ?? ""}
              onChange={(e) => v.badge && set("badge", { ...v.badge, text: e.target.value })}
              disabled={!v.badge}
              placeholder={v.badge ? "" : "প্রথমে ভ্যারিয়েন্ট বাছাই করুন"}
            />
          </Field>
        </div>
        {v.badge && (
          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${
                BADGE_STYLES[v.badge.variant].gradient
              } px-3 py-1 text-xs font-bold text-white shadow`}
            >
              {BADGE_STYLES[v.badge.variant].icon} {v.badge.text}
            </span>
          </div>
        )}
      </section>

      {/* Course Modules Section */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-semibold text-base">কোর্স মডিউল ({(v.modules || []).length})</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ড্রপডাউন/অ্যাকর্ডিয়ন আকারে কোর্স কারিকুলাম দেখানোর জন্য মডিউল ও টপিক যুক্ত করুন।
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const current = v.modules || [];
              const num = String(current.length + 1).padStart(2, "0");
              set("modules", [
                ...current,
                {
                  id: Date.now(),
                  module_no: `Module-${num}`,
                  title: "",
                  topics: [
                    "টপিক ১ — বিবরণ লিখুন",
                    "টপিক ২ — বিবরণ লিখুন",
                  ],
                },
              ]);
            }}
          >
            + মডিউল যোগ করুন
          </Button>
        </div>

        {(v.modules || []).length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            এখনো কোনো মডিউল যোগ করা হয়নি। "+ মডিউল যোগ করুন" বাটনে ক্লিক করে মডিউল তৈরি করুন।
          </div>
        )}

        <div className="space-y-4">
          {(v.modules || []).map((mod, idx) => (
            <div key={mod.id || idx} className="rounded-xl border border-border bg-background p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md shrink-0">
                    #{idx + 1}
                  </span>
                  <Input
                    value={mod.module_no || `Module-${String(idx + 1).padStart(2, "0")}`}
                    onChange={(e) => {
                      const next = [...(v.modules || [])];
                      next[idx] = { ...mod, module_no: e.target.value };
                      set("modules", next);
                    }}
                    placeholder="Module-01"
                    className="w-32 font-bold shrink-0"
                  />
                  <Input
                    value={mod.title}
                    onChange={(e) => {
                      const next = [...(v.modules || [])];
                      next[idx] = { ...mod, title: e.target.value };
                      set("modules", next);
                    }}
                    placeholder="যেমন: Foundation-Digital Marketing And AI Basics"
                    className="flex-1 font-semibold"
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const next = (v.modules || []).filter((_, i) => i !== idx);
                    set("modules", next);
                  }}
                >
                  মডিউল মুছুন
                </Button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  টপিক/লেসন সমূহ (প্রতি লাইনে ১টি টপিক লিখুন)
                </label>
                <Textarea
                  rows={4}
                  value={(mod.topics || []).join("\n")}
                  onChange={(e) => {
                    const lines = e.target.value.split("\n");
                    const next = [...(v.modules || [])];
                    next[idx] = { ...mod, topics: lines };
                    set("modules", next);
                  }}
                  placeholder={"• Core concepts of digital marketing\n• What is AI and how it works\n• Role and impact of AI in marketing\n• Introduction to popular AI tools"}
                  className="font-sans text-xs leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">লেসন ({v.lessons.length})</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              set("lessons", [
                ...v.lessons,
                { id: Date.now(), title: "নতুন লেসন", video_url: "", is_preview: 0, sort_order: v.lessons.length + 1 },
              ])
            }
          >
            + লেসন যোগ
          </Button>
        </div>
        {v.lessons.length === 0 && (
          <p className="text-sm text-muted-foreground">এখনো কোনো লেসন যোগ করা হয়নি।</p>
        )}
        <div className="space-y-2">
          {v.lessons.map((l, idx) => (
            <div key={l.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto] items-center rounded-md border border-border p-2">
              <Input
                value={l.title}
                onChange={(e) => {
                  const next = [...v.lessons];
                  next[idx] = { ...l, title: e.target.value };
                  set("lessons", next);
                }}
                placeholder="লেসন টাইটেল"
              />
              <Input
                value={l.video_url || ""}
                onChange={(e) => {
                  const next = [...v.lessons];
                  next[idx] = { ...l, video_url: e.target.value };
                  set("lessons", next);
                }}
                placeholder="ভিডিও URL"
              />
              <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                <input
                  type="checkbox"
                  checked={!!l.is_preview}
                  onChange={(e) => {
                    const next = [...v.lessons];
                    next[idx] = { ...l, is_preview: e.target.checked ? 1 : 0 };
                    set("lessons", next);
                  }}
                />
                Preview
              </label>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() =>
                  set(
                    "lessons",
                    v.lessons.filter((_, i) => i !== idx),
                  )
                }
              >
                মুছুন
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
