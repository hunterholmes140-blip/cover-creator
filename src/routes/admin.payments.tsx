import { createFileRoute } from "@tanstack/react-router";
import { usePayments } from "@/lib/admin-store";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";
import { useState, useEffect } from "react";
import { getEpsConfig, saveEpsConfig, type EpsConfig } from "@/lib/eps-client";
import { ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsAdmin,
});

function PaymentsAdmin() {
  const { items, update } = usePayments();
  const toast = useToast();
  const [drafts, setDrafts] = useState<Record<string, any>>({});
  const [epsForm, setEpsForm] = useState<EpsConfig>(getEpsConfig());
  const [epsSaved, setEpsSaved] = useState(false);

  useEffect(() => {
    setEpsForm(getEpsConfig());
  }, []);

  const getVal = (m: any, k: string) => drafts[m.id]?.[k] ?? m[k];
  const setVal = (m: any, k: string, v: any) =>
    setDrafts((d) => ({ ...d, [m.id]: { ...d[m.id], [k]: v } }));

  const save = (m: any) => {
    update(m.id, drafts[m.id] ?? {});
    setDrafts((d) => {
      const { [m.id]: _, ...rest } = d;
      return rest;
    });
    toast.show(`${m.label} আপডেট হয়েছে`);
  };

  const handleSaveEps = (e: React.FormEvent) => {
    e.preventDefault();
    saveEpsConfig(epsForm);
    setEpsSaved(true);
    toast.show("EPS পেমেন্ট গেটওয়ে ক্রেডেনশিয়াল সেভ হয়েছে ⚡");
    setTimeout(() => setEpsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="পেমেন্ট মেথড ও অটোমেটিক গেটওয়ে"
        subtitle="EPS অটোমেটিক পেমেন্ট গেটওয়ে ক্রেডেনশিয়াল এবং bKash, Nagad, Rocket-এর ম্যানুয়াল নাম্বার এখান থেকে নিয়ন্ত্রণ করুন।"
      />

      {/* ⚡ EPS Automated Gateway Config Card */}
      <Card className="border-2 border-primary/30 bg-card shadow-lg">
        <form onSubmit={handleSaveEps} className="space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg text-primary">
                <Zap className="h-5 w-5 fill-primary text-primary animate-pulse" /> ⚡ EPS Easy Payment System (অটোমেটিক গেটওয়ে)
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                bKash, Nagad, Rocket, Visa & Mastercard দিয়ে অটোমেটিক ইন্সট্যান্ট পেমেন্ট রিসিভ করার অফিশিয়াল API সেটআপ।
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={!!epsForm.is_sandbox}
                  onChange={(e) => setEpsForm((f) => ({ ...f, is_sandbox: e.target.checked ? 1 : 0 }))}
                />
                Sandbox Test Mode
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                <input
                  type="checkbox"
                  checked={!!epsForm.enabled}
                  onChange={(e) => setEpsForm((f) => ({ ...f, enabled: e.target.checked ? 1 : 0 }))}
                />
                সক্রিয় (Active)
              </label>
            </div>
          </div>

          {epsSaved && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-700 dark:text-green-400 font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> EPS গেটওয়ে ক্রেডেনশিয়াল সেভ করা হয়েছে!
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="EPS Merchant Username (userName)" required hint="যেমন: your_merchant_username">
              <Input
                value={epsForm.username}
                onChange={(e) => setEpsForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="your_merchant_username"
                required={!!epsForm.enabled}
              />
            </Field>

            <Field label="EPS Password (password)" required hint="যেমন: your_merchant_password">
              <Input
                type="password"
                value={epsForm.password}
                onChange={(e) => setEpsForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••••••"
                required={!!epsForm.enabled}
              />
            </Field>

            <Field label="Merchant ID (merchantId)" required hint="যেমন: 094980ee-XXX-XXX-XXX">
              <Input
                value={epsForm.merchant_id}
                onChange={(e) => setEpsForm((f) => ({ ...f, merchant_id: e.target.value }))}
                placeholder="094980ee-XXXX-XXXX"
                required={!!epsForm.enabled}
              />
            </Field>

            <Field label="Store ID (storeId)" required hint="যেমন: 35b518f6-XXXX-XXXX">
              <Input
                value={epsForm.store_id}
                onChange={(e) => setEpsForm((f) => ({ ...f, store_id: e.target.value }))}
                placeholder="35b518f6-XXXX-XXXX"
                required={!!epsForm.enabled}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Hash Key (SFNLQ...)" required hint="HMAC-SHA512 `x-hash` হেডার তৈরিতে ব্যবহৃত হয়">
                <Input
                  value={epsForm.hash_key}
                  onChange={(e) => setEpsForm((f) => ({ ...f, hash_key: e.target.value }))}
                  placeholder="SFNLQHJlY2lwZX..."
                  required={!!epsForm.enabled}
                />
              </Field>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Button type="submit">EPS ক্রেডেনশিয়াল সেভ করুন</Button>
            <span className="text-xs text-muted-foreground">API Version 0.5 (Easy Payment System)</span>
          </div>
        </form>
      </Card>

      {/* Manual Payment Methods (bKash, Nagad, Rocket) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">ম্যানুয়াল সেন্ড মানি মেথড</h3>
        {items.map((m: any) => (
          <Card key={m.id}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold">{m.label}</div>
                <div className="text-xs text-muted-foreground">{m.type}</div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!getVal(m, "enabled")}
                  onChange={(e) => setVal(m, "enabled", e.target.checked ? 1 : 0)}
                />
                সক্রিয়
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="নাম্বার">
                <Input value={getVal(m, "number")} onChange={(e) => setVal(m, "number", e.target.value)} />
              </Field>
              <Field label="লেবেল">
                <Input value={getVal(m, "label")} onChange={(e) => setVal(m, "label", e.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Instructions">
                  <Textarea rows={2} value={getVal(m, "instructions")} onChange={(e) => setVal(m, "instructions", e.target.value)} />
                </Field>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={() => save(m)}>সেভ করুন</Button>
            </div>
          </Card>
        ))}
      </div>
      {toast.node}
    </div>
  );
}
