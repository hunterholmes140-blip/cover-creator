import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { usePages } from "@/lib/admin-store";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/pages")({
  component: PagesAdmin,
});

function PagesAdmin() {
  const { items, update } = usePages();
  const toast = useToast();
  const [selected, setSelected] = useState<any>(items[0] ?? null);

  if (!selected && items.length > 0) setSelected(items[0]);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="পেইজ কন্টেন্ট"
        subtitle="About, Privacy, Terms, Refund, Affiliate, Free Courses — এই পেইজগুলোর কন্টেন্ট এডিট করুন।"
      />

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {items.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left p-3 text-sm hover:bg-accent transition ${
                  selected?.id === p.id ? "bg-primary/10 text-primary font-medium" : ""
                }`}
              >
                <div>{p.title}</div>
                <div className="text-xs text-muted-foreground">/{p.slug}</div>
              </button>
            ))}
          </div>
        </Card>

        {selected && (
          <Card>
            <div className="space-y-4">
              <Field label="টাইটেল">
                <Input value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })} />
              </Field>
              <Field label="Slug (URL)">
                <Input value={selected.slug} disabled />
              </Field>
              <Field label="কন্টেন্ট" hint="সাধারণ টেক্সট / সংক্ষিপ্ত markdown">
                <Textarea rows={14} value={selected.content} onChange={(e) => setSelected({ ...selected, content: e.target.value })} />
              </Field>
              <Button
                onClick={() => {
                  update(selected.id, { title: selected.title, content: selected.content });
                  toast.show("পেইজ আপডেট হয়েছে");
                }}
              >
                সেভ করুন
              </Button>
            </div>
          </Card>
        )}
      </div>

      {toast.node}
    </div>
  );
}
