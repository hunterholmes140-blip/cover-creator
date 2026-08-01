import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Field, Input, Button, useToast } from "@/components/admin/ui";
import { useState, useEffect } from "react";
import { getEpsConfig, saveEpsConfig, type EpsConfig } from "@/lib/eps-client";
import { ShieldCheck, Zap } from "lucide-react";

import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsAdmin,
});

function PaymentsAdmin() {
  const toast = useToast();
  const [epsForm, setEpsForm] = useState<EpsConfig>(getEpsConfig());
  const [epsSaving, setEpsSaving] = useState(false);
  const [epsSaved, setEpsSaved] = useState(false);

  useEffect(() => {
    // Load EPS settings directly from database if available
    api<{ value: any }>("content.php", { query: { key: "eps_settings" } })
      .then((res) => {
        if (res && res.value && typeof res.value === "object") {
          setEpsForm((prev) => ({ ...prev, ...res.value }));
          saveEpsConfig(res.value);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveEps = async (e: React.FormEvent) => {
    e.preventDefault();
    setEpsSaving(true);
    try {
      await saveEpsConfig(epsForm);
      setEpsSaved(true);
      toast.show("EPS পেমেন্ট গেটওয়ে ক্রেডেনশিয়াল ডাটাবেজে সেভ হয়েছে ⚡");
      setTimeout(() => setEpsSaved(false), 3000);
    } catch (err: any) {
      toast.show("সেভ হতে সমস্যা হয়েছে: " + (err.message || "ত্রুটি"));
    } finally {
      setEpsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="অটোমেটিক পেমেন্ট গেটওয়ে (EPS Easy Payment System)"
        subtitle="bKash, Nagad, Rocket, Visa & Mastercard দিয়ে অটোমেটিক পেমেন্ট রিসিভ করার অফিশিয়াল EPS API সেটআপ।"
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
                bKash, Nagad, Rocket, Visa & Mastercard দিয়ে অটোমেটিক ইন্সট্যান্ট পেমেন্ট রিসিভ করার অফিশিয়াল API সেটআপ।
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!epsForm.is_sandbox}
                  onChange={(e) => setEpsForm((f) => ({ ...f, is_sandbox: e.target.checked ? 1 : 0 }))}
                />
                Sandbox Test Mode
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-bold text-primary cursor-pointer">
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
            <Button type="submit" disabled={epsSaving}>
              {epsSaving ? "সেভ হচ্ছে..." : "EPS ক্রেডেনশিয়াল সেভ করুন"}
            </Button>
            <span className="text-xs text-muted-foreground">API Version 0.5 (Easy Payment System)</span>
          </div>
        </form>
      </Card>
      {toast.node}
    </div>
  );
}
