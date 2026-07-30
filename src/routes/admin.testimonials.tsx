import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTestimonials } from "@/lib/admin-store";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Trash2, Save } from "lucide-react";

export const Route = createFileRoute("/admin/testimonials")({
  component: TestimonialsAdmin,
});

const AVATAR_COLORS = [
  "from-primary to-primary/70",
  "from-fuchsia-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-indigo-500",
];

function TestimonialsAdmin() {
  const { items, add, update, remove, saveNow } = useTestimonials();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", role: "", comment: "", rating: 5, avatar_image: "", avatar_color: AVATAR_COLORS[0] });

  const submit = async () => {
    if (!form.name.trim() || !form.comment.trim()) { toast.show("নাম ও মন্তব্য দিন"); return; }
    add({ ...form });
    await saveNow();
    setForm({ name: "", role: "", comment: "", rating: 5, avatar_image: "", avatar_color: AVATAR_COLORS[0] });
    toast.show("টেস্টিমোনিয়াল যোগ হয়েছে");
  };

  const handleSave = async () => {
    await saveNow();
    toast.show("সেভ হয়েছে");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader title="টেস্টিমোনিয়াল" subtitle="শিক্ষার্থীদের মতামত ম্যানেজ করুন — হোমপেজে দেখাবে।" />

      <Card>
        <h3 className="font-semibold mb-3">নতুন টেস্টিমোনিয়াল</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="নাম"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="ভূমিকা / কোর্স"><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="যেমন: Web Development শিক্ষার্থী" /></Field>
          <Field label="ছবি (আপলোড বা লিংক)">
            <ImageUpload
              value={form.avatar_image}
              onChange={(url) => setForm({ ...form, avatar_image: url })}
              aspect="square"
              maxDim={500}
            />
          </Field>
          <Field label="রেটিং (১-৫)"><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></Field>
          <div className="md:col-span-2">
            <Field label="মন্তব্য"><Textarea rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></Field>
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={submit}><Plus className="h-4 w-4" /> যোগ করুন</Button>
        </div>
      </Card>

      <div className="space-y-4">
        {items.map((t: any) => (
          <Card key={t.id}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="নাম"><Input value={t.name} onChange={(e) => update(t.id, { name: e.target.value })} /></Field>
              <Field label="ভূমিকা"><Input value={t.role} onChange={(e) => update(t.id, { role: e.target.value })} /></Field>
              <Field label="ছবি (আপলোড বা লিংক)">
                <ImageUpload
                  value={t.avatar_image || ""}
                  onChange={(url) => update(t.id, { avatar_image: url })}
                  aspect="square"
                  maxDim={500}
                />
              </Field>
              <Field label="রেটিং"><Input type="number" min={1} max={5} value={t.rating} onChange={(e) => update(t.id, { rating: Number(e.target.value) })} /></Field>
              <div className="md:col-span-2">
                <Field label="মন্তব্য"><Textarea rows={2} value={t.comment} onChange={(e) => update(t.id, { comment: e.target.value })} /></Field>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center border-t pt-3">
              <span className="text-xs text-muted-foreground font-mono">ID: {t.id}</span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSave}><Save className="h-4 w-4" /> সেভ</Button>
                <Button variant="danger" onClick={async () => { if (confirm("ডিলিট করবেন?")) { remove(t.id); await saveNow(); } }}><Trash2 className="h-4 w-4" /> ডিলিট</Button>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 && <Card><p className="text-sm text-muted-foreground">কোনো টেস্টিমোনিয়াল নেই।</p></Card>}
      </div>
      {toast.node}
    </div>
  );
}
