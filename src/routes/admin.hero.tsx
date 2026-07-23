import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { useHero } from "@/lib/admin-store";
import { PageHeader, Card, Field, Input, Textarea, Button, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/hero")({
  component: HeroAdmin,
});

function HeroAdmin() {
  const { items, add, update, remove, replaceAll } = useHero();
  const toast = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [heading, setHeading] = useState("");
  const [sub, setSub] = useState("");
  const [url, setUrl] = useState("");
  const [confirmId, setConfirmId] = useState<any>(null);

  const startEdit = (v: any) => {
    setEditing(v);
    setHeading(v.heading);
    setSub(v.subheading);
    setUrl(v.youtube_url);
  };
  const reset = () => {
    setEditing(null);
    setHeading("");
    setSub("");
    setUrl("");
  };
  const save = () => {
    if (!heading.trim() || !url.trim()) return;
    if (editing) {
      update(editing.id, { heading, subheading: sub, youtube_url: url });
      toast.show("আপডেট হয়েছে");
    } else {
      add({ heading, subheading: sub, youtube_url: url });
      toast.show("যোগ হয়েছে");
    }
    reset();
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    replaceAll(next);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="হিরো ভিডিও স্লাইডস"
        subtitle="হোমপেজের উপরের ভিডিও স্লাইডশোতে দেখাবে। YouTube লিঙ্ক ব্যবহার করুন।"
      />

      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.length === 0 && <Empty title="এখনো কোনো স্লাইড নেই।" />}
          {items.map((v: any, idx: number) => (
            <Card key={v.id} className="flex gap-4 items-start">
              <div className="flex flex-col gap-1">
                <button onClick={() => move(idx, -1)} className="p-1 rounded hover:bg-accent" title="উপরে">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs text-muted-foreground text-center">{idx + 1}</span>
                <button onClick={() => move(idx, 1)} className="p-1 rounded hover:bg-accent" title="নিচে">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{v.heading}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{v.subheading}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">{v.youtube_url}</div>
              </div>
              <div className="flex gap-1 shrink-0">
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
          <h3 className="font-semibold mb-4">{editing ? "স্লাইড এডিট" : "নতুন স্লাইড"}</h3>
          <div className="space-y-3">
            <Field label="হেডিং" required>
              <Input value={heading} onChange={(e) => setHeading(e.target.value)} />
            </Field>
            <Field label="সাব-হেডিং">
              <Textarea rows={2} value={sub} onChange={(e) => setSub(e.target.value)} />
            </Field>
            <Field label="YouTube URL" required>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </Field>
            <div className="flex gap-2">
              <Button onClick={save}>
                <Plus className="h-4 w-4" /> {editing ? "আপডেট" : "যোগ"}
              </Button>
              {editing && <Button variant="secondary" onClick={reset}>বাতিল</Button>}
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          remove(confirmId);
          toast.show("ডিলিট হয়েছে");
        }}
      />
      {toast.node}
    </div>
  );
}
