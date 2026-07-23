import { createFileRoute } from "@tanstack/react-router";
import { usePayments } from "@/lib/admin-store";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";
import { useState } from "react";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsAdmin,
});

function PaymentsAdmin() {
  const { items, update } = usePayments();
  const toast = useToast();
  const [drafts, setDrafts] = useState<Record<string, any>>({});

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

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="পেমেন্ট মেথড" subtitle="bKash, Nagad, Rocket-এর নাম্বার ও instructions সেট করুন।" />
      <div className="space-y-4">
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
