import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useCategories, makeSlug } from "@/lib/admin-store";
import { PageHeader, Card, Field, Input, Button, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { items, add, update, remove } = useCategories();
  const toast = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [confirmId, setConfirmId] = useState<any>(null);

  const startEdit = (c: any) => {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
  };
  const reset = () => {
    setEditing(null);
    setName("");
    setSlug("");
  };

  const save = () => {
    if (!name.trim()) return;
    const s = slug.trim() || makeSlug(name);
    if (editing) {
      update(editing.id, { name, slug: s });
      toast.show("ক্যাটাগরি আপডেট হয়েছে");
    } else {
      add({ name, slug: s });
      toast.show("ক্যাটাগরি যোগ হয়েছে");
    }
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="ক্যাটাগরি" subtitle="কোর্স ক্যাটাগরি যোগ, এডিট বা ডিলিট করুন।" />

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <Card className="p-0 overflow-hidden">
          {items.length === 0 ? (
            <Empty title="এখনো কোনো ক্যাটাগরি নেই।" />
          ) : (
            <div className="divide-y divide-border">
              {items.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">/{c.slug}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(c)}>
                      <Pencil className="h-3 w-3" /> এডিট
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmId(c.id)}>
                      <Trash2 className="h-3 w-3" /> ডিলিট
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">{editing ? "এডিট করুন" : "নতুন ক্যাটাগরি"}</h3>
          <div className="space-y-3">
            <Field label="নাম" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Slug" hint="খালি রাখলে নাম থেকে অটো তৈরি হবে">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </Field>
            <div className="flex gap-2">
              <Button onClick={save}>
                <Plus className="h-4 w-4" /> {editing ? "আপডেট" : "যোগ করুন"}
              </Button>
              {editing && (
                <Button variant="secondary" onClick={reset}>
                  বাতিল
                </Button>
              )}
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
