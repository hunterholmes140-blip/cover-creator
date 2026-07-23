import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useVideos } from "@/lib/admin-store";
import { PageHeader, Card, Field, Input, Textarea, Button, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/videos")({
  component: VideosAdmin,
});

function VideosAdmin() {
  const { items, add, update, remove } = useVideos();
  const toast = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ title: "", description: "", youtube_url: "", duration: "", category: "" });
  const [confirmId, setConfirmId] = useState<any>(null);

  const startEdit = (v: any) => {
    setEditing(v);
    setForm({
      title: v.title,
      description: v.description,
      youtube_url: v.youtube_url,
      duration: v.duration,
      category: v.category,
    });
  };
  const reset = () => {
    setEditing(null);
    setForm({ title: "", description: "", youtube_url: "", duration: "", category: "" });
  };
  const save = () => {
    if (!form.title.trim() || !form.youtube_url.trim()) return;
    if (editing) {
      update(editing.id, form);
      toast.show("আপডেট হয়েছে");
    } else {
      add(form);
      toast.show("যোগ হয়েছে");
    }
    reset();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="ভিডিও গ্যালারি" subtitle="হোমপেজের ভিডিও গ্যালারি সেকশন।" />

      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.length === 0 && <Empty title="কোনো ভিডিও নেই।" />}
          {items.map((v: any) => (
            <Card key={v.id} className="flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">{v.category}</span>
                  <span className="text-xs text-muted-foreground">{v.duration}</span>
                </div>
                <div className="font-semibold mt-1">{v.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{v.description}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">{v.youtube_url}</div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button size="sm" variant="secondary" onClick={() => startEdit(v)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="danger" onClick={() => setConfirmId(v.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <h3 className="font-semibold mb-4">{editing ? "এডিট" : "নতুন ভিডিও"}</h3>
          <div className="space-y-3">
            <Field label="টাইটেল" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="বিবরণ"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="YouTube URL" required><Input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="সময়কাল"><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="৫:২৩" /></Field>
              <Field label="ক্যাটাগরি"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="সাফল্য" /></Field>
            </div>
            <div className="flex gap-2">
              <Button onClick={save}><Plus className="h-4 w-4" /> {editing ? "আপডেট" : "যোগ"}</Button>
              {editing && <Button variant="secondary" onClick={reset}>বাতিল</Button>}
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog open={confirmId !== null} onClose={() => setConfirmId(null)} onConfirm={() => { remove(confirmId); toast.show("ডিলিট হয়েছে"); }} />
      {toast.node}
    </div>
  );
}
