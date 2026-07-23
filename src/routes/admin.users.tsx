import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, Search } from "lucide-react";
import { useLiveUsers } from "@/lib/live-store";
import { PageHeader, Card, Input, Button, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const { items, remove, loading, error } = useLiveUsers();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<any>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return items;
    return items.filter(
      (u: any) => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.phone?.includes(s),
    );
  }, [items, q]);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="ইউজার" subtitle={`মোট ${items.length} জন ইউজার।`} />

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-4 relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="সার্চ..." className="pl-9" />
      </div>

      {loading && items.length === 0 ? (
        <Card><div className="p-6 text-sm text-muted-foreground text-center">লোড হচ্ছে…</div></Card>
      ) : filtered.length === 0 ? (
        <Empty title="কোনো ইউজার নেই।" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">নাম</th>
                <th className="p-3 font-medium">ইমেইল</th>
                <th className="p-3 font-medium">ফোন</th>
                <th className="p-3 font-medium">কোর্স</th>
                <th className="p-3 font-medium">জয়েন</th>
                <th className="p-3 font-medium text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3 text-muted-foreground">{u.phone}</td>
                  <td className="p-3">{u.enrolled_count ?? u.course_count ?? 0}</td>
                  <td className="p-3 text-muted-foreground">{u.created_at}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="danger" onClick={() => setConfirmId(u.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={async () => {
          try { await remove(confirmId); toast.show("ডিলিট হয়েছে"); }
          catch (e: any) { toast.show(e?.message || "ডিলিট ব্যর্থ"); }
        }}
      />
      {toast.node}
    </div>
  );
}
