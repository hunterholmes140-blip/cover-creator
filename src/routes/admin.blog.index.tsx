import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useBlog } from "@/lib/admin-store";
import { PageHeader, Card, Button, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/blog")({
  component: BlogList,
});

function BlogList() {
  const { items, remove } = useBlog();
  const toast = useToast();
  const [confirmId, setConfirmId] = useState<any>(null);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="ব্লগ পোস্ট"
        subtitle={`${items.length} টি পোস্ট।`}
        actions={
          <Link to="/admin/blog/new">
            <Button><Plus className="h-4 w-4" /> নতুন পোস্ট</Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <Empty title="কোনো পোস্ট নেই।" />
      ) : (
        <div className="grid gap-3">
          {items.map((p: any) => (
            <Card key={p.id} className="flex gap-4 items-center">
              {p.cover_image && (
                <img src={p.cover_image} alt="" className="h-16 w-24 rounded object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">{p.category} · {p.published_at} · {p.read_time}</div>
                <div className="font-semibold truncate">{p.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">{p.excerpt}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to="/admin/blog/$slug" params={{ slug: p.slug }}>
                  <Button size="sm" variant="secondary"><Pencil className="h-3 w-3" /></Button>
                </Link>
                <Button size="sm" variant="danger" onClick={() => setConfirmId(p.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog open={confirmId !== null} onClose={() => setConfirmId(null)} onConfirm={() => { remove(confirmId); toast.show("ডিলিট হয়েছে"); }} />
      {toast.node}
    </div>
  );
}
