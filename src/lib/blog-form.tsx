import { useState } from "react";
import { makeSlug } from "@/lib/admin-store";
import { Field, Input, Textarea, Button } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";


export type BlogFormValue = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  published_at: string;
  read_time: string;
  cover_image: string;
  cover_gradient: string;
};

export const emptyBlog: BlogFormValue = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  category: "",
  published_at: new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" }),
  read_time: "৫ মিনিট",
  cover_image: "",
  cover_gradient: "from-blue-500 via-cyan-500 to-teal-500",
};

export function BlogForm({
  initial,
  onSubmit,
  submitLabel = "সেভ করুন",
}: {
  initial: BlogFormValue;
  onSubmit: (v: BlogFormValue) => void;
  submitLabel?: string;
}) {
  const [v, setV] = useState<BlogFormValue>(initial);
  const set = <K extends keyof BlogFormValue>(k: K, val: BlogFormValue[K]) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...v, slug: v.slug.trim() || makeSlug(v.title) });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="টাইটেল" required><Input value={v.title} onChange={(e) => set("title", e.target.value)} required /></Field>
          <Field label="Slug"><Input value={v.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
          <Field label="লেখক"><Input value={v.author} onChange={(e) => set("author", e.target.value)} /></Field>
          <Field label="ক্যাটাগরি"><Input value={v.category} onChange={(e) => set("category", e.target.value)} /></Field>
          <Field label="প্রকাশের তারিখ"><Input value={v.published_at} onChange={(e) => set("published_at", e.target.value)} /></Field>
          <Field label="পড়ার সময়"><Input value={v.read_time} onChange={(e) => set("read_time", e.target.value)} /></Field>
          <Field label="Cover Image">
            <ImageUpload value={v.cover_image} onChange={(url) => set("cover_image", url)} />
          </Field>

          <Field label="Cover Gradient" hint='যেমন: "from-blue-500 via-cyan-500 to-teal-500"'>
            <Input value={v.cover_gradient} onChange={(e) => set("cover_gradient", e.target.value)} />
          </Field>
        </div>
        <Field label="সংক্ষিপ্ত বিবরণ (Excerpt)"><Textarea rows={2} value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field>
        <Field label="বিস্তারিত কন্টেন্ট"><Textarea rows={10} value={v.content} onChange={(e) => set("content", e.target.value)} /></Field>
      </section>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
