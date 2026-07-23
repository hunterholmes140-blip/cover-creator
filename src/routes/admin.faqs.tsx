import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFaqs } from "@/lib/admin-store";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/faqs")({
  component: FaqsAdmin,
});

function FaqsAdmin() {
  const { items, add, update, remove } = useFaqs();
  const toast = useToast();
  const [q, setQ] = useState(""); const [a, setA] = useState("");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="FAQ" subtitle="সাধারণ প্রশ্ন ও উত্তর — হোমপেজ ও /faq পেজে দেখাবে।" />

      <Card>
        <div className="grid gap-3">
          <Field label="প্রশ্ন"><Input value={q} onChange={(e) => setQ(e.target.value)} /></Field>
          <Field label="উত্তর"><Textarea rows={3} value={a} onChange={(e) => setA(e.target.value)} /></Field>
          <div>
            <Button onClick={() => {
              if (!q.trim() || !a.trim()) { toast.show("প্রশ্ন ও উত্তর দিন"); return; }
              add({ q, a });
              setQ(""); setA(""); toast.show("যোগ হয়েছে");
            }}><Plus className="h-4 w-4" /> নতুন FAQ যোগ করুন</Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((f: any) => (
          <Card key={f.id}>
            <div className="grid gap-3">
              <Field label="প্রশ্ন"><Input value={f.q} onChange={(e) => update(f.id, { q: e.target.value })} /></Field>
              <Field label="উত্তর"><Textarea rows={2} value={f.a} onChange={(e) => update(f.id, { a: e.target.value })} /></Field>
              <div className="flex justify-end">
                <Button variant="danger" onClick={() => { if (confirm("ডিলিট?")) remove(f.id); }}><Trash2 className="h-4 w-4" /> ডিলিট</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {toast.node}
    </div>
  );
}
