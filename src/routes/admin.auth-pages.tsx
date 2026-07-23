import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useContent } from "@/lib/content-store";
import { AUTH_CONTENT_DEFAULTS, CONTENT_KEYS, type AuthContent } from "@/lib/content-defaults";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";
import { RotateCcw, Save } from "lucide-react";

export const Route = createFileRoute("/admin/auth-pages")({
  component: AuthPagesAdmin,
});

const GROUPS: { title: string; fields: (keyof AuthContent)[] }[] = [
  {
    title: "লগইন পেইজ",
    fields: [
      "loginTitle", "loginSubtitle",
      "loginEmailLabel", "loginPasswordLabel",
      "loginSubmitLabel", "loginSubmittingLabel",
      "loginFooterText", "loginFooterLinkLabel",
      "loginExtraHtml",
    ],
  },
  {
    title: "রেজিস্টার পেইজ",
    fields: [
      "registerTitle", "registerSubtitle",
      "registerNameLabel", "registerEmailLabel",
      "registerPhoneLabel", "registerPasswordLabel",
      "registerSubmitLabel", "registerSubmittingLabel",
      "registerFooterText", "registerFooterLinkLabel",
      "registerExtraHtml",
    ],
  },
];

const LABELS: Record<keyof AuthContent, string> = {
  loginTitle: "লগইন — টাইটেল",
  loginSubtitle: "লগইন — সাব-টেক্সট",
  loginEmailLabel: "ইমেইল ফিল্ড লেবেল",
  loginPasswordLabel: "পাসওয়ার্ড ফিল্ড লেবেল",
  loginSubmitLabel: "সাবমিট বাটন লেবেল",
  loginSubmittingLabel: "সাবমিট চলাকালীন লেবেল",
  loginFooterText: "নিচের ফুটার টেক্সট",
  loginFooterLinkLabel: "ফুটার লিঙ্ক লেবেল (রেজিস্টার)",
  loginExtraHtml: "অতিরিক্ত কন্টেন্ট (HTML সাপোর্ট) — খালি রাখলে দেখাবে না",

  registerTitle: "রেজিস্টার — টাইটেল",
  registerSubtitle: "রেজিস্টার — সাব-টেক্সট",
  registerNameLabel: "নাম ফিল্ড লেবেল",
  registerEmailLabel: "ইমেইল ফিল্ড লেবেল",
  registerPhoneLabel: "ফোন ফিল্ড লেবেল",
  registerPasswordLabel: "পাসওয়ার্ড ফিল্ড লেবেল",
  registerSubmitLabel: "সাবমিট বাটন লেবেল",
  registerSubmittingLabel: "সাবমিট চলাকালীন লেবেল",
  registerFooterText: "নিচের ফুটার টেক্সট",
  registerFooterLinkLabel: "ফুটার লিঙ্ক লেবেল (লগইন)",
  registerExtraHtml: "অতিরিক্ত কন্টেন্ট (HTML সাপোর্ট) — খালি রাখলে দেখাবে না",
};

const LONG_FIELDS = new Set<keyof AuthContent>([
  "loginSubtitle", "registerSubtitle", "loginExtraHtml", "registerExtraHtml",
]);

function AuthPagesAdmin() {
  const [content, , setAll] = useContent(CONTENT_KEYS.AUTH, AUTH_CONTENT_DEFAULTS);
  const [form, setForm] = useState<AuthContent>(content);
  const toast = useToast();

  useEffect(() => setForm(content), [content]);

  const set = <K extends keyof AuthContent>(k: K, v: AuthContent[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => { setAll(form); toast.show("লগইন/রেজিস্টার কন্টেন্ট সেভ হয়েছে"); };
  const reset = () => { setAll(AUTH_CONTENT_DEFAULTS); setForm(AUTH_CONTENT_DEFAULTS); toast.show("ডিফল্টে ফিরানো হয়েছে"); };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="লগইন / রেজিস্টার পেইজ"
        subtitle="লগইন ও রেজিস্টার পেইজের সব টেক্সট এখান থেকে এডিট করুন। অতিরিক্ত কন্টেন্ট চাইলে HTML দিয়ে যোগ/রিমুভ করা যাবে।"
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
                  <Textarea rows={4} value={form[f] as string} onChange={(e) => set(f, e.target.value as any)} />
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
