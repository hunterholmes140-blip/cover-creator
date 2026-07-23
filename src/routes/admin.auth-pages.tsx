import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useContent } from "@/lib/content-store";
import {
  AUTH_CONTENT_DEFAULTS, CONTENT_KEYS,
  type AuthContent, type RegisterField, type RegisterFieldType,
} from "@/lib/content-defaults";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";
import { RotateCcw, Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/admin/auth-pages")({
  component: AuthPagesAdmin,
});

type TextKey = Exclude<keyof AuthContent, "registerFields" | "showName" | "showPhone">;

const GROUPS: { title: string; fields: TextKey[] }[] = [
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

const LABELS: Record<TextKey, string> = {
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

const LONG_FIELDS = new Set<TextKey>([
  "loginSubtitle", "registerSubtitle", "loginExtraHtml", "registerExtraHtml",
]);

const TYPE_LABELS: Record<RegisterFieldType, string> = {
  text: "টেক্সট", email: "ইমেইল", tel: "ফোন", number: "সংখ্যা",
  textarea: "লম্বা টেক্সট", select: "ড্রপডাউন", checkbox: "চেকবক্স",
};

function AuthPagesAdmin() {
  const [content, , setAll] = useContent(CONTENT_KEYS.AUTH, AUTH_CONTENT_DEFAULTS);
  const [form, setForm] = useState<AuthContent>(content);
  const toast = useToast();

  useEffect(() => setForm(content), [content]);

  const setText = (k: TextKey, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setFlag = (k: "showName" | "showPhone", v: boolean) => setForm((f) => ({ ...f, [k]: v }));

  const fields = form.registerFields ?? [];
  const updateFields = (next: RegisterField[]) => setForm((f) => ({ ...f, registerFields: next }));

  const addField = () => {
    const id = `field_${Date.now().toString(36)}`;
    updateFields([...fields, { id, label: "নতুন ফিল্ড", type: "text", required: false }]);
  };
  const patchField = (i: number, patch: Partial<RegisterField>) =>
    updateFields(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const removeField = (i: number) => updateFields(fields.filter((_, idx) => idx !== i));
  const moveField = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[i], next[j]] = [next[j], next[i]];
    updateFields(next);
  };

  const save = () => { setAll(form); toast.show("লগইন/রেজিস্টার কন্টেন্ট সেভ হয়েছে"); };
  const reset = () => { setAll(AUTH_CONTENT_DEFAULTS); setForm(AUTH_CONTENT_DEFAULTS); toast.show("ডিফল্টে ফিরানো হয়েছে"); };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="লগইন / রেজিস্টার পেইজ"
        subtitle="লগইন ও রেজিস্টার পেইজের সব টেক্সট এখান থেকে এডিট করুন। প্রয়োজনে রেজিস্টার ফর্মে নতুন ফিল্ড যোগ/রিমুভ করুন।"
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
                  <Textarea rows={4} value={form[f] as string} onChange={(e) => setText(f, e.target.value)} />
                ) : (
                  <Input value={form[f] as string} onChange={(e) => setText(f, e.target.value)} />
                )}
              </Field>
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <h3 className="font-semibold text-base mb-1">বিল্ট-ইন ফিল্ড অন/অফ</h3>
        <p className="text-xs text-muted-foreground mb-4">ইমেইল ও পাসওয়ার্ড সবসময় থাকবে। নিচেরগুলো চাইলে বন্ধ করা যাবে।</p>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showName !== false}
              onChange={(e) => setFlag("showName", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
            নাম ফিল্ড দেখাও
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showPhone !== false}
              onChange={(e) => setFlag("showPhone", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
            ফোন ফিল্ড দেখাও
          </label>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-base">অতিরিক্ত ফিল্ড</h3>
            <p className="text-xs text-muted-foreground">রেজিস্টার ফর্মে নিজের পছন্দমতো ফিল্ড যোগ করুন — টেক্সট, ড্রপডাউন, চেকবক্স ইত্যাদি।</p>
          </div>
          <Button onClick={addField}><Plus className="h-4 w-4" /> ফিল্ড যোগ করুন</Button>
        </div>

        {fields.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-6 text-center">
            কোনো অতিরিক্ত ফিল্ড নেই। "ফিল্ড যোগ করুন" বাটনে ক্লিক করুন।
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((f, i) => (
              <div key={f.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs text-muted-foreground font-mono">#{i + 1} · id: {f.id}</div>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveField(i, -1)} className="p-1.5 rounded hover:bg-accent" title="উপরে"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => moveField(i, 1)} className="p-1.5 rounded hover:bg-accent" title="নিচে"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => removeField(i)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="ডিলিট"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="লেবেল">
                    <Input value={f.label} onChange={(e) => patchField(i, { label: e.target.value })} />
                  </Field>
                  <Field label="টাইপ">
                    <select
                      value={f.type}
                      onChange={(e) => patchField(i, { type: e.target.value as RegisterFieldType })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                      {(Object.keys(TYPE_LABELS) as RegisterFieldType[]).map((t) => (
                        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </Field>
                  {f.type !== "checkbox" && (
                    <Field label="প্লেসহোল্ডার (ঐচ্ছিক)">
                      <Input value={f.placeholder ?? ""} onChange={(e) => patchField(i, { placeholder: e.target.value })} />
                    </Field>
                  )}
                  {f.type === "select" && (
                    <Field label="অপশন (কমা দিয়ে আলাদা করুন)">
                      <Input value={f.options ?? ""} onChange={(e) => patchField(i, { options: e.target.value })} placeholder="ঢাকা, চট্টগ্রাম, সিলেট" />
                    </Field>
                  )}
                  <Field label="আইডি (ইউনিক কী)">
                    <Input value={f.id} onChange={(e) => patchField(i, { id: e.target.value.replace(/\s+/g, "_") })} />
                  </Field>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!f.required}
                        onChange={(e) => patchField(i, { required: e.target.checked })}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                      বাধ্যতামূলক
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save}><Save className="h-4 w-4" /> সেভ করুন</Button>
      </div>
      {toast.node}
    </div>
  );
}
