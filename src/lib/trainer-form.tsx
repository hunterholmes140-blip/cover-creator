import { useState } from "react";
import { makeSlug } from "@/lib/admin-store";
import { Field, Input, Textarea, Button } from "@/components/admin/ui";

export type TrainerFormValue = {
  name: string;
  slug: string;
  title: string;
  tagline: string;
  bio: string;
  expertise: string[];
  students: number;
  courses: number;
  rating: number;
  avatar_url: string;
  is_mentor: boolean;
  location: string;
  email: string;
  phone: string;
  website: string;
  languages: string[];
  experience: { role: string; company: string; period: string; description: string }[];
  education: { degree: string; school: string; period: string }[];
  certifications: string[];
  achievements: string[];
  social: { facebook?: string; linkedin?: string; youtube?: string; twitter?: string; github?: string };
};

export const emptyTrainer: TrainerFormValue = {
  name: "",
  slug: "",
  title: "",
  tagline: "",
  bio: "",
  expertise: [],
  students: 0,
  courses: 0,
  rating: 5,
  avatar_url: "",
  is_mentor: false,
  location: "",
  email: "",
  phone: "",
  website: "",
  languages: [],
  experience: [],
  education: [],
  certifications: [],
  achievements: [],
  social: {},
};

function ChipInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (!t) return;
    onChange([...value, t]);
    setText("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="secondary" onClick={add}>
          যোগ
        </Button>
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
              {v}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrainerForm({
  initial,
  onSubmit,
  submitLabel = "সেভ করুন",
}: {
  initial: TrainerFormValue;
  onSubmit: (v: TrainerFormValue) => void;
  submitLabel?: string;
}) {
  const [v, setV] = useState<TrainerFormValue>(initial);
  const set = <K extends keyof TrainerFormValue>(k: K, val: TrainerFormValue[K]) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...v, slug: v.slug.trim() || makeSlug(v.name) });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">প্রোফাইল</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="নাম" required>
            <Input value={v.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="Slug" hint="খালি রাখলে অটো তৈরি">
            <Input value={v.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="পদবি">
            <Input value={v.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="ট্যাগলাইন">
            <Input value={v.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="বায়ো">
            <Textarea rows={4} value={v.bio} onChange={(e) => set("bio", e.target.value)} />
          </Field>
          <Field label="ছবির URL">
            <Input value={v.avatar_url} onChange={(e) => set("avatar_url", e.target.value)} />
            {v.avatar_url && (
              <img src={v.avatar_url} alt="" className="mt-2 h-16 w-16 rounded-full object-cover" />
            )}
          </Field>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.is_mentor} onChange={(e) => set("is_mentor", e.target.checked)} />
          প্রধান মেন্টর হিসেবে দেখাবে
        </label>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">যোগাযোগ</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="লোকেশন"><Input value={v.location} onChange={(e) => set("location", e.target.value)} /></Field>
          <Field label="ইমেইল"><Input type="email" value={v.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="ফোন"><Input value={v.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="ওয়েবসাইট"><Input value={v.website} onChange={(e) => set("website", e.target.value)} /></Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">এক্সপার্টিজ ও ভাষা</h3>
        <Field label="এক্সপার্টিজ" hint="Enter চেপে যোগ করুন">
          <ChipInput value={v.expertise} onChange={(x) => set("expertise", x)} placeholder="যেমন: React" />
        </Field>
        <Field label="ভাষা">
          <ChipInput value={v.languages} onChange={(x) => set("languages", x)} placeholder="যেমন: বাংলা" />
        </Field>
        <Field label="সার্টিফিকেশন">
          <ChipInput value={v.certifications} onChange={(x) => set("certifications", x)} placeholder="সার্টিফিকেট নাম" />
        </Field>
        <Field label="অর্জন">
          <ChipInput value={v.achievements} onChange={(x) => set("achievements", x)} placeholder="অর্জন" />
        </Field>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">অভিজ্ঞতা</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => set("experience", [...v.experience, { role: "", company: "", period: "", description: "" }])}
          >
            + যোগ
          </Button>
        </div>
        {v.experience.map((exp, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-2 rounded-md border border-border p-3">
            <Input placeholder="পদবি" value={exp.role} onChange={(e) => {
              const next = [...v.experience]; next[i] = { ...exp, role: e.target.value }; set("experience", next);
            }} />
            <Input placeholder="কোম্পানি" value={exp.company} onChange={(e) => {
              const next = [...v.experience]; next[i] = { ...exp, company: e.target.value }; set("experience", next);
            }} />
            <Input placeholder="সময়কাল (২০২০ — বর্তমান)" value={exp.period} onChange={(e) => {
              const next = [...v.experience]; next[i] = { ...exp, period: e.target.value }; set("experience", next);
            }} />
            <div className="md:col-span-2">
              <Textarea rows={2} placeholder="বিবরণ" value={exp.description} onChange={(e) => {
                const next = [...v.experience]; next[i] = { ...exp, description: e.target.value }; set("experience", next);
              }} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="button" variant="danger" size="sm" onClick={() => set("experience", v.experience.filter((_, j) => j !== i))}>
                মুছুন
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">শিক্ষা</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => set("education", [...v.education, { degree: "", school: "", period: "" }])}
          >
            + যোগ
          </Button>
        </div>
        {v.education.map((ed, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-3 rounded-md border border-border p-3">
            <Input placeholder="ডিগ্রি" value={ed.degree} onChange={(e) => {
              const next = [...v.education]; next[i] = { ...ed, degree: e.target.value }; set("education", next);
            }} />
            <Input placeholder="প্রতিষ্ঠান" value={ed.school} onChange={(e) => {
              const next = [...v.education]; next[i] = { ...ed, school: e.target.value }; set("education", next);
            }} />
            <Input placeholder="সময়কাল" value={ed.period} onChange={(e) => {
              const next = [...v.education]; next[i] = { ...ed, period: e.target.value }; set("education", next);
            }} />
            <div className="md:col-span-3 flex justify-end">
              <Button type="button" variant="danger" size="sm" onClick={() => set("education", v.education.filter((_, j) => j !== i))}>
                মুছুন
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">পরিসংখ্যান</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="শিক্ষার্থী সংখ্যা"><Input type="number" value={v.students} onChange={(e) => set("students", Number(e.target.value))} /></Field>
          <Field label="কোর্স সংখ্যা"><Input type="number" value={v.courses} onChange={(e) => set("courses", Number(e.target.value))} /></Field>
          <Field label="রেটিং"><Input type="number" step="0.1" min={0} max={5} value={v.rating} onChange={(e) => set("rating", Number(e.target.value))} /></Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold">সোশ্যাল লিঙ্ক</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {(["facebook", "linkedin", "youtube", "twitter", "github"] as const).map((k) => (
            <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
              <Input value={v.social[k] ?? ""} onChange={(e) => set("social", { ...v.social, [k]: e.target.value })} />
            </Field>
          ))}
        </div>
      </section>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
