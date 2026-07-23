import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, Trash2, Search } from "lucide-react";
import { useOrders } from "@/lib/admin-store";
import { taka } from "@/lib/format";
import { PageHeader, Card, Input, Button, Badge, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = ["all", "pending", "approved", "rejected"] as const;

function OrdersAdmin() {
  const { items, update, remove } = useOrders();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [confirmId, setConfirmId] = useState<any>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return items.filter((o: any) => {
      if (status !== "all" && o.status !== status) return false;
      if (!s) return true;
      return (
        o.user_name?.toLowerCase().includes(s) ||
        o.user_email?.toLowerCase().includes(s) ||
        o.course_title?.toLowerCase().includes(s) ||
        o.transaction_id?.toLowerCase().includes(s)
      );
    });
  }, [items, q, status]);

  const setStatusFor = (id: any, s: string) => {
    update(id, { status: s });
    toast.show(`অর্ডার ${s}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="অর্ডার ম্যানেজমেন্ট" subtitle={`মোট ${items.length} টি অর্ডার।`} />

      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="সার্চ..." className="pl-9" />
        </div>
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium border ${
                status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty title="কোনো অর্ডার পাওয়া যায়নি।" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3 font-medium">অর্ডার</th>
                  <th className="p-3 font-medium">ইউজার</th>
                  <th className="p-3 font-medium">কোর্স</th>
                  <th className="p-3 font-medium">পেমেন্ট</th>
                  <th className="p-3 font-medium">দাম</th>
                  <th className="p-3 font-medium">স্ট্যাটাস</th>
                  <th className="p-3 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o: any) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="font-mono text-xs">#{o.id}</div>
                      <div className="text-xs text-muted-foreground">{o.created_at}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{o.user_name}</div>
                      <div className="text-xs text-muted-foreground">{o.user_email}</div>
                      <div className="text-xs text-muted-foreground">{o.user_phone}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{o.course_title}</td>
                    <td className="p-3">
                      <div>{o.payment_method}</div>
                      <div className="text-xs font-mono text-muted-foreground">{o.transaction_id}</div>
                    </td>
                    <td className="p-3 font-semibold">{taka(o.amount)}</td>
                    <td className="p-3">
                      <Badge color={o.status === "approved" ? "green" : o.status === "pending" ? "amber" : "red"}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        {o.status !== "approved" && (
                          <Button size="sm" variant="primary" onClick={() => setStatusFor(o.id, "approved")}>
                            <Check className="h-3 w-3" /> Approve
                          </Button>
                        )}
                        {o.status !== "rejected" && (
                          <Button size="sm" variant="secondary" onClick={() => setStatusFor(o.id, "rejected")}>
                            <X className="h-3 w-3" /> Reject
                          </Button>
                        )}
                        <Button size="sm" variant="danger" onClick={() => setConfirmId(o.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog open={confirmId !== null} onClose={() => setConfirmId(null)} onConfirm={() => { remove(confirmId); toast.show("ডিলিট হয়েছে"); }} />
      {toast.node}
    </div>
  );
}
