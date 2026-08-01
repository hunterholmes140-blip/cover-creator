import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, Trash2, Search, Eye, Phone, Mail, MapPin, User, FileText, Calendar, CreditCard, Filter, RotateCcw } from "lucide-react";
import { useLiveOrders } from "@/lib/live-store";
import { taka } from "@/lib/format";
import { PageHeader, Card, Input, Button, Badge, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = [
  { id: "all", label: "সব অর্ডার" },
  { id: "approved", label: "এপ্রুভড" },
  { id: "pending", label: "পেন্ডিং" },
  { id: "failed", label: "পেমেন্ট ফেইলার" },
  { id: "rejected", label: "বাতিল" },
] as const;

function getPaymentLabel(o: any) {
  const pm = String(o.payment_method || "").toLowerCase();
  const note = String(o.note || "");
  const tx = String(o.transaction_id || "");
  if (pm === "eps_online" || pm === "eps" || note.includes("EPS") || tx.startsWith("TXN") || pm === "manual") {
    return "EPS Online Payment";
  }
  if (pm === "bkash") return "bKash";
  if (pm === "nagad") return "Nagad";
  if (pm === "rocket") return "Rocket";
  return "EPS Online Gateway";
}

function renderStatusBadge(status: string) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") {
    return <Badge color="green">এপ্রুভড (Approved)</Badge>;
  }
  if (s === "pending") {
    return <Badge color="amber">পেন্ডিং (Pending)</Badge>;
  }
  if (s === "failed") {
    return <Badge color="red">পেমেন্ট ফেইলার</Badge>;
  }
  if (s === "rejected") {
    return <Badge color="red">পেমেন্ট ফেইলার / বাতিল</Badge>;
  }
  return <Badge color="gray">{status}</Badge>;
}

export function OrdersAdmin() {
  const { items, update, remove, loading, error } = useLiveOrders();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [confirmId, setConfirmId] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Quick Date Helpers
  const setQuickDate = (type: "today" | "7days" | "month" | "all") => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    if (type === "today") {
      const str = formatDate(today);
      setStartDate(str);
      setEndDate(str);
    } else if (type === "7days") {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (type === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(today));
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();

    return items.filter((o: any) => {
      // 1. Status Filter
      const ordStatus = String(o.status || "").toLowerCase();
      if (status !== "all") {
        if (status === "failed") {
          // match status failed or rejected
          if (ordStatus !== "failed" && ordStatus !== "rejected") return false;
        } else if (ordStatus !== status) {
          return false;
        }
      }

      // 2. Date Filter
      if (startDate || endDate) {
        let orderDateStr = "";
        if (o.created_at) {
          orderDateStr = String(o.created_at).split("T")[0].split(" ")[0];
        }
        if (startDate && orderDateStr < startDate) return false;
        if (endDate && orderDateStr > endDate) return false;
      }

      // 3. Search Filter
      if (!s) return true;
      const phone = o.user_phone || o.sender_number || "";
      const label = getPaymentLabel(o).toLowerCase();
      return (
        o.user_name?.toLowerCase().includes(s) ||
        o.user_email?.toLowerCase().includes(s) ||
        phone.toLowerCase().includes(s) ||
        o.note?.toLowerCase().includes(s) ||
        o.course_title?.toLowerCase().includes(s) ||
        o.transaction_id?.toLowerCase().includes(s) ||
        label.includes(s)
      );
    });
  }, [items, q, status, startDate, endDate]);

  const setStatusFor = async (id: any, s: string) => {
    try {
      await update(id, { status: s });
      toast.show(`অর্ডার স্ট্যাটাস ${s} করা হয়েছে`);
    } catch (e: any) {
      toast.show(e?.message || "আপডেট ব্যর্থ");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="অর্ডার ম্যানেজমেন্ট" subtitle={`মোট ${items.length} টি অর্ডারের মধ্যে ফিল্টার অনুযায়ী ${filtered.length} টি দেখাচ্ছে।`} />

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Control Panel: Search, Date Range, Status Filter */}
      <Card className="p-4 space-y-4 bg-card border-border shadow-sm">
        {/* Search and Date Pickers */}
        <div className="grid gap-3 md:grid-cols-12 items-center">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="নাম, ইমেইল, ফোন, TrxID দিয়ে সার্চ..." className="pl-9 text-xs" />
          </div>

          {/* Date Range Inputs */}
          <div className="md:col-span-8 flex flex-wrap items-center gap-2 justify-end">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>শুরু:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-36 text-xs h-8 py-1 px-2"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span>শেষ:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-36 text-xs h-8 py-1 px-2"
              />
            </div>

            {/* Quick Date Range Buttons */}
            <div className="flex items-center gap-1">
              <Button size="sm" variant="secondary" onClick={() => setQuickDate("today")} className="h-8 px-2 text-[11px]">
                আজকে
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setQuickDate("7days")} className="h-8 px-2 text-[11px]">
                গত ৭ দিন
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setQuickDate("month")} className="h-8 px-2 text-[11px]">
                এই মাস
              </Button>
              {(startDate || endDate) && (
                <Button size="sm" variant="danger" onClick={() => setQuickDate("all")} className="h-8 px-2 text-[11px] gap-1" title="তারিখ রিসেট করুন">
                  <RotateCcw className="h-3 w-3" /> রিসেট
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-primary" /> ফিল্টার:
            </span>
            {STATUSES.map((st) => {
              const count = items.filter((o: any) => {
                const s = String(o.status || "").toLowerCase();
                if (st.id === "all") return true;
                if (st.id === "failed") return s === "failed" || s === "rejected";
                return s === st.id;
              }).length;

              return (
                <button
                  key={st.id}
                  onClick={() => setStatus(st.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    status === st.id
                      ? st.id === "failed" || st.id === "rejected"
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
                        : st.id === "approved"
                        ? "bg-green-600 text-white border-green-600 shadow-sm"
                        : st.id === "pending"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border hover:bg-muted/60 text-muted-foreground"
                  }`}
                >
                  <span>{st.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    status === st.id ? "bg-white/20 text-white" : "bg-muted text-foreground"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {(startDate || endDate || q || status !== "all") && (
            <div className="text-xs text-muted-foreground">
              ফিল্টারকৃত মোট অর্ডারের পরিমাণ: <strong className="text-primary font-bold">{taka(filtered.reduce((sum, o) => sum + Number(o.amount || 0), 0))}</strong>
            </div>
          )}
        </div>
      </Card>

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
                  <th className="p-3 font-medium">পেমেন্ট মেথড</th>
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
                        {o.note && !o.note.includes("EPS Order") && !o.note.includes("ORD-") && !o.note.includes("TXN") && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate max-w-[200px]" title={o.note}>
                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                            {o.note}
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium text-foreground">{o.course_title}</td>
                      <td className="p-3">
                        <span className="font-semibold text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded inline-block">
                          {getPaymentLabel(o)}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-foreground">{taka(o.amount)}</td>
                      <td className="p-3">
                        {renderStatusBadge(o.status)}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1.5 justify-end items-center flex-wrap">
                          <Button size="sm" variant="secondary" onClick={() => setSelectedOrder(o)} title="সকল ইউজার তথ্য দেখুন">
                            <Eye className="h-3.5 w-3.5" /> ইউজার তথ্য
                          </Button>

                          {o.status !== "approved" && (
                            <Button size="sm" variant="primary" onClick={() => setStatusFor(o.id, "approved")}>
                              <Check className="h-3 w-3" /> Approve
                            </Button>
                          )}
                          {o.status !== "rejected" && o.status !== "failed" && (
                            <Button size="sm" variant="secondary" onClick={() => setStatusFor(o.id, "failed")}>
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

      {/* 📋 Comprehensive User Details Popup Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold h-8 w-8 rounded-full bg-muted flex items-center justify-center"
            >
              ✕
            </button>

            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> ইউজার ও অর্ডারের সম্পূর্ণ তথ্য
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                অর্ডার নং #{selectedOrder.id} • তারিখ: {selectedOrder.created_at}
              </p>
            </div>

            <div className="space-y-4 text-sm">
              {/* User Identity Section */}
              <div className="bg-muted/40 rounded-xl p-3.5 space-y-2 border border-border">
                <div className="text-xs font-bold text-primary uppercase tracking-wider">গ্রাহকের আইডেন্টিটি</div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">নাম:</span>
                  <span className="font-semibold text-foreground">{selectedOrder.user_name || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">ইমেইল:</span>
                  <span className="font-mono text-xs text-foreground select-all">{selectedOrder.user_email || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">ফোন নম্বর:</span>
                  <span className="font-mono text-xs font-bold text-primary select-all">
                    {selectedOrder.user_phone || selectedOrder.sender_number ? (
                      <a href={`tel:${selectedOrder.user_phone || selectedOrder.sender_number}`} className="hover:underline">
                        {selectedOrder.user_phone || selectedOrder.sender_number}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
              </div>

              {/* Order & Course Info Section */}
              <div className="bg-muted/40 rounded-xl p-3.5 space-y-2 border border-border">
                <div className="text-xs font-bold text-primary uppercase tracking-wider">কোর্স ও পেমেন্ট বিবরণ</div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">কোর্স:</span>
                  <span className="font-semibold text-foreground">{selectedOrder.course_title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">মূল্য:</span>
                  <span className="font-bold text-primary">{taka(selectedOrder.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">পেমেন্ট মেথড:</span>
                  <span className="font-semibold text-xs">{getPaymentLabel(selectedOrder)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">বর্তমান স্টেটাস:</span>
                  <span>{renderStatusBadge(selectedOrder.status)}</span>
                </div>
              </div>

              {/* User Note / Address / Remarks */}
              {selectedOrder.note && !selectedOrder.note.includes("EPS Order") && !selectedOrder.note.includes("ORD-") && !selectedOrder.note.includes("TXN") && (
                <div className="bg-muted/40 rounded-xl p-3.5 space-y-1 border border-border">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider">ঠিকানা / অতিরিক্ত নোট</div>
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{selectedOrder.note}</p>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
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
          try {
            await remove(confirmId);
            toast.show("অর্ডার ডিলিট হয়েছে");
          } catch (e: any) {
            toast.show(e?.message || "ডিলিট ব্যর্থ");
          }
        }}
      />
      {toast.node}
    </div>
  );
}
