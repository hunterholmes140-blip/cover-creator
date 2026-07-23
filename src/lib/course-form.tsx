// শেয়ার্ড কোর্স ফর্ম — new এবং edit উভয় পেজে ব্যবহার হয়।
import { useState } from "react";
import { makeSlug } from "@/lib/admin-store";
import { useLiveCategories } from "@/lib/live-store";
import { BADGE_PRESETS, BADGE_STYLES, type BadgeVariant } from "@/lib/course-badges";
import { Field, Input, Textarea, Select, Button } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";


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
  level: "beginner" | "intermediate" | "advanced";
  is_published: 0 | 1;
  is_featured: 0 | 1;
  badge: { text: string; variant: BadgeVariant } | null;
  lessons: any[];
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
  level: "beginner",
  is_published: 1,
  is_featured: 0,
  badge: null,
  lessons: [],
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
          <Field label="ইন্সট্রাক্টর">
            <Input value={v.instructor} onChange={(e) => set("instructor", e.target.value)} />
          </Field>
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
