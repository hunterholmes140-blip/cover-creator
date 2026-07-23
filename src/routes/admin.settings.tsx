import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSiteSettings, DEFAULT_SETTINGS, type SiteSettings, whatsappLink } from "@/lib/site-settings";
import { Save, RotateCcw, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-foreground">{label}</div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${props.className ?? ""}`}
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 rounded border border-border bg-transparent cursor-pointer"
      />
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function AdminSettingsPage() {
  const { settings, update, reset } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    update(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">সাইট সেটিংস</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ব্র্যান্ড, যোগাযোগ, WhatsApp নাম্বার ও কালার এখান থেকে নিয়ন্ত্রণ করুন।
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { reset(); setForm(DEFAULT_SETTINGS); }}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4" /> ডিফল্টে ফিরুন
          </button>
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4" /> সেভ করুন
          </button>
        </div>
      </header>

      {saved && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-400">
          সেটিংস সেভ হয়েছে ✓
        </div>
      )}

      {/* Brand */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">ব্র্যান্ড</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ব্র্যান্ডের নাম">
            <TextInput value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
          </Field>
          <Field label="ট্যাগলাইন">
            <TextInput value={form.brandTagline} onChange={(e) => set("brandTagline", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">যোগাযোগ</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp নাম্বার" hint="ইন্টারন্যাশনাল ফরম্যাট, শুধু ডিজিট (যেমন: 8801700000000)">
            <TextInput
              value={form.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value.replace(/[^\d]/g, ""))}
              placeholder="8801700000000"
            />
            {form.whatsappNumber && (
              <a
                href={whatsappLink(form.whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                লিঙ্ক টেস্ট করুন <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </Field>
          <Field label="ফোন">
            <TextInput value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} />
          </Field>
          <Field label="ইমেইল">
            <TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Social */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">সোশ্যাল লিঙ্ক</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook URL"><TextInput value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} /></Field>
          <Field label="YouTube URL"><TextInput value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} /></Field>
          <Field label="Instagram URL"><TextInput value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} /></Field>
          <Field label="LinkedIn URL"><TextInput value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} /></Field>
        </div>
      </section>

      {/* Colors */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">কালার</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary (HSL)" hint='HSL values: "262 83% 58%"'>
            <TextInput value={form.primaryHsl} onChange={(e) => set("primaryHsl", e.target.value)} />
          </Field>
          <Field label="Accent (HSL)">
            <TextInput value={form.accentHsl} onChange={(e) => set("accentHsl", e.target.value)} />
          </Field>
          <Field label="ফুটার গ্র্যাডিয়েন্ট — শুরু">
            <ColorInput value={form.footerFrom} onChange={(v) => set("footerFrom", v)} />
          </Field>
          <Field label="ফুটার গ্র্যাডিয়েন্ট — মধ্য">
            <ColorInput value={form.footerVia} onChange={(v) => set("footerVia", v)} />
          </Field>
          <Field label="ফুটার গ্র্যাডিয়েন্ট — শেষ">
            <ColorInput value={form.footerTo} onChange={(v) => set("footerTo", v)} />
          </Field>
        </div>
        <div className="rounded-lg overflow-hidden border border-border">
          <div
            className="h-16"
            style={{
              backgroundImage: `linear-gradient(135deg, ${form.footerFrom} 0%, ${form.footerVia} 45%, ${form.footerTo} 100%)`,
            }}
          />
          <div className="px-3 py-2 text-xs text-muted-foreground bg-card">প্রিভিউ — ফুটার গ্র্যাডিয়েন্ট</div>
        </div>
      </section>

      <div className="pt-4">
        <button
          onClick={save}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-4 w-4" /> সেভ করুন
        </button>
      </div>
    </div>
  );
}
