import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Star, Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { useLiveCourses } from "@/lib/live-store";
import { taka } from "@/lib/format";
import { resolveBadge, BADGE_STYLES } from "@/lib/course-badges";
import { PageHeader, Card, Input, Button, ConfirmDialog, useToast, Empty, Badge } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/courses")({
  component: CoursesList,
});

function CoursesList() {
  const { items, update, remove, loading, error } = useLiveCourses();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<any>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return items;
    return items.filter(
      (c: any) =>
        c.title?.toLowerCase().includes(s) ||
        c.slug?.toLowerCase().includes(s) ||
        c.instructor?.toLowerCase().includes(s),
    );
  }, [items, q]);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="কোর্স ম্যানেজমেন্ট"
        subtitle={`মোট ${items.length} টি কোর্স। যোগ, এডিট, publish/unpublish, featured toggle করুন।`}
        actions={
          <Link to="/admin/courses/new">
            <Button>
              <Plus className="h-4 w-4" /> নতুন কোর্স
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="সার্চ করুন..." className="pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty
          title="কোনো কোর্স নেই।"
          action={
            <Link to="/admin/courses/new">
              <Button>
                <Plus className="h-4 w-4" /> প্রথম কোর্স যোগ করুন
              </Button>
            </Link>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3 font-medium">কোর্স</th>
                  <th className="p-3 font-medium">ক্যাটাগরি</th>
                  <th className="p-3 font-medium">দাম</th>
                  <th className="p-3 font-medium">ব্যাজ</th>
                  <th className="p-3 font-medium">স্ট্যাটাস</th>
                  <th className="p-3 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c: any) => {
                  const b = resolveBadge(c);
                  const style = b ? BADGE_STYLES[b.variant] : null;
                  return (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {c.thumbnail && (
                            <img src={c.thumbnail} alt="" className="h-10 w-14 rounded object-cover shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate">{c.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{c.instructor}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{c.category_name}</td>
                      <td className="p-3 font-semibold">{taka(c.discount_price ?? c.price)}</td>
                      <td className="p-3">
                        {b && style ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${style.gradient} px-2 py-0.5 text-[11px] font-bold text-white`}
                          >
                            {style.icon} {b.text}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <Badge color={c.is_published ? "green" : "muted"}>
                            {c.is_published ? "Published" : "Draft"}
                          </Badge>
                          {c.is_featured ? <Badge color="amber">Featured</Badge> : null}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            title={c.is_published ? "Unpublish" : "Publish"}
                            onClick={() => update(c.id, { is_published: c.is_published ? 0 : 1 })}
                            className="p-2 rounded hover:bg-accent"
                          >
                            {c.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            title="Featured toggle"
                            onClick={() => update(c.id, { is_featured: c.is_featured ? 0 : 1 })}
                            className={`p-2 rounded hover:bg-accent ${c.is_featured ? "text-amber-500" : ""}`}
                          >
                            <Star className="h-4 w-4" fill={c.is_featured ? "currentColor" : "none"} />
                          </button>
                          <Link to="/admin/courses/$slug" params={{ slug: c.slug }}>
                            <Button size="sm" variant="secondary">
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="danger" onClick={() => setConfirmId(c.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          remove(confirmId);
          toast.show("কোর্স ডিলিট হয়েছে");
        }}
        message="এই কোর্সটি ডিলিট করলে সব লেসনও মুছে যাবে।"
      />
      {toast.node}
    </div>
  );
}
