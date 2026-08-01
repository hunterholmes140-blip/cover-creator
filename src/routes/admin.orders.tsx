import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, Trash2, Search, Eye, Phone, Mail, MapPin, User, FileText, Calendar, CreditCard } from "lucide-react";
import { useLiveOrders } from "@/lib/live-store";
import { taka } from "@/lib/format";
import { PageHeader, Card, Input, Button, Badge, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = ["all", "pending", "approved", "rejected"] as const;

function OrdersAdmin() {
  const { items, update, remove, loading, error } = useLiveOrders();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [confirmId, setConfirmId] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return items.filter((o: any) => {
      if (status !== "all" && o.status !== status) return false;
      if (!s) return true;
      const phone = o.user_phone || o.sender_number || "";
      return (
        o.user_name?.toLowerCase().includes(s) ||
        o.user_email?.toLowerCase().includes(s) ||
        phone.toLowerCase().includes(s) ||
        o.note?.toLowerCase().includes(s) ||
        o.course_title?.toLowerCase().includes(s) ||
        o.transaction_id?.toLowerCase().includes(s)
      );
    });
  }, [items, q, status]);

  const setStatusFor = async (id: any, s: string) => {
    try {
      await update(id, { status: s });
      toast.show(`অর্ডার ${s}`);
    } catch (e: any) {
      toast.show(e?.message || "আপডেট ব্যর্থ");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="অর্ডার ম্যানেজমেন্ট" subtitle={`মোট ${items.length} টি অর্ডার।`} />

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="নাম, ইমেইল, ফোন, TrxID দিয়ে সার্চ..." className="pl-9" />
        </div>
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium border capitalize ${
                status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && items.length === 0 ? (
        <Card><div className="p-6 text-sm text-muted-foreground text-center">লোড হচ্ছে…</div></Card>
      ) : filtered.length === 0 ? (
        <Empty title="কোনো অর্ডার পাওয়া যায়নি।" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3 font-medium">অর্ডার</th>
                  <th className="p-3 font-medium">ইউজার তথ্য (User Details)</th>
                  <th className="p-3 font-medium">কোর্স</th>
                  <th className="p-3 font-medium">পেমেন্ট</th>
                  <th className="p-3 font-medium">দাম</th>
                  <th className="p-3 font-medium">স্ট্যাটাস</th>
                  <th className="p-3 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o: any) => {
                  const phone = o.user_phone || o.sender_number;
                  return (
                    <tr key={o.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-mono text-xs font-bold text-primary">#{o.id}</div>
                        <div className="text-[11px] text-muted-foreground">{o.created_at}</div>
                      </td>
                      <td className="p-3 space-y-0.5">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {o.user_name || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                          {o.user_email || "N/A"}
                        </div>
                        <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-primary shrink-0" />
                          {phone ? (
                            <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                          ) : (
                            <span className="text-muted-foreground font-normal">ফোন নম্বর নেই</span>
                          )}
                        </div>
                        {o.note && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate max-w-[200px]" title={o.note}>
                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                            {o.note}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium text-foreground">{o.course_title}</td>
                      <td className="p-3">
                        <div className="font-medium capitalize">{o.payment_method}</div>
                        <div className="text-xs font-mono text-muted-foreground">{o.transaction_id || "-"}</div>
                      </td>
                      <td className="p-3 font-bold text-foreground">{taka(o.amount)}</td>
                      <td className="p-3">
                        <Badge color={o.status === "approved" ? "green" : o.status === "pending" ? "amber" : "red"}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-end items-center">
                          <Button size="sm" variant="secondary" onClick={() => setSelectedOrder(o)} title="সকল ইউজার তথ্য দেখুন">
                            <Eye className="h-3.5 w-3.5" /> ইউজার তথ্য
                          </Button>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* USER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> ইউজার ও অর্ডারের সম্পূর্ণ তথ্য
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="rounded-xl bg-muted/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">অর্ডার আইডি</span>
                  <span className="font-mono font-bold text-primary">#{selectedOrder.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">তারিখ ও সময়</span>
                  <span className="text-xs font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedOrder.created_at}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">স্ট্যাটাস</span>
                  <Badge color={selectedOrder.status === "approved" ? "green" : selectedOrder.status === "pending" ? "amber" : "red"}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {/* User Personal Details */}
              <div className="border border-border rounded-xl p-4 space-y-3 bg-background">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">গ্রাহকের ব্যক্তিগত তথ্য</h4>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
                      <User className="h-3.5 w-3.5 text-primary" /> পূর্ণ নাম:
                    </span>
                    <span className="font-semibold text-foreground text-right">{selectedOrder.user_name || "N/A"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
                      <Phone className="h-3.5 w-3.5 text-primary" /> মোবাইল নম্বর:
                    </span>
                    <span className="font-bold text-primary font-mono text-right">
                      {selectedOrder.user_phone || selectedOrder.sender_number ? (
                        <a href={`tel:${selectedOrder.user_phone || selectedOrder.sender_number}`} className="hover:underline">
                          {selectedOrder.user_phone || selectedOrder.sender_number}
                        </a>
                      ) : (
                        "ফোন নম্বর পাওয়া যায়নি"
                      )}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
                      <Mail className="h-3.5 w-3.5 text-primary" /> ইমেইল ঠিকানা:
                    </span>
                    <span className="font-medium text-foreground text-right font-mono text-xs">{selectedOrder.user_email || "N/A"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-border/50">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> সম্পূর্ণ ঠিকানা / নোট:
                    </span>
                    <span className="font-medium text-foreground text-right text-xs">
                      {selectedOrder.note || "ঠিকানা দেওয়া হয়নি"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order & Payment Details */}
              <div className="border border-border rounded-xl p-4 space-y-3 bg-background">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">পেমেন্ট ও কোর্সের তথ্য</h4>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
                      <FileText className="h-3.5 w-3.5 text-primary" /> কোর্সের নাম:
                    </span>
                    <span className="font-semibold text-foreground text-right">{selectedOrder.course_title}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
                      <CreditCard className="h-3.5 w-3.5 text-primary" /> পেমেন্ট মেথড:
                    </span>
                    <span className="font-semibold capitalize text-foreground">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
                      # Transaction ID:
                    </span>
                    <span className="font-mono font-semibold text-foreground">{selectedOrder.transaction_id || "N/A"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2 pt-1 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">মোট পরিশোধিত টাকা:</span>
                    <span className="font-bold text-base text-primary">{taka(selectedOrder.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              {selectedOrder.status !== "approved" && (
                <Button size="sm" variant="primary" onClick={() => { setStatusFor(selectedOrder.id, "approved"); setSelectedOrder(null); }}>
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
              )}
              {selectedOrder.status !== "rejected" && (
                <Button size="sm" variant="secondary" onClick={() => { setStatusFor(selectedOrder.id, "rejected"); setSelectedOrder(null); }}>
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => setSelectedOrder(null)}>
                বন্ধ করুন
              </Button>
            </div>
          </div>
        </div>
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
