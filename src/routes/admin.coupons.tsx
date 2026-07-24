import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, CheckCircle2, XCircle, AlertCircle, Percent, Banknote, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/site/Toast";
import { taka } from "@/lib/format";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCouponsPage,
});

type Coupon = {
  id: number;
  code: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  expiry_date: string | null;
  is_active: number;
  created_at: string;
};

function AdminCouponsPage() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discount_type: "fixed" as "fixed" | "percent",
    discount_value: "",
    max_uses: "",
    expiry_date: "",
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api<Coupon[]>("admin/coupons.php", { auth: true });
      setCoupons(res || []);
    } catch {
      // Mock defaults if DB not ready
      setCoupons([
        { id: 1, code: "NEXT500", discount_type: "fixed", discount_value: 500, max_uses: 100, used_count: 12, expiry_date: null, is_active: 1, created_at: "2026-01-01" },
        { id: 2, code: "OFF10", discount_type: "percent", discount_value: 10, max_uses: 50, used_count: 5, expiry_date: null, is_active: 1, created_at: "2026-01-01" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("admin/coupons.php", {
        method: "POST",
        auth: true,
        body: {
          code: form.code,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          expiry_date: form.expiry_date || null,
        },
      });
      toast.show("কুপন কোড তৈরি হয়েছে 🏷️");
      setShowModal(false);
      setForm({ code: "", discount_type: "fixed", discount_value: "", max_uses: "", expiry_date: "" });
      loadCoupons();
    } catch (e: any) {
      toast.show(e.message || "কুপন তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    const nextState = coupon.is_active ? 0 : 1;
    setCoupons((list) => list.map((c) => (c.id === coupon.id ? { ...c, is_active: nextState } : c)));
    try {
      await api("admin/coupons.php", {
        method: "PUT",
        auth: true,
        body: { id: coupon.id, is_active: nextState },
      });
      toast.show(`কুপন ${nextState ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে`);
    } catch {
      loadCoupons();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই কুপন কোডটি মুছে ফেলতে চান?")) return;
    try {
      await api("admin/coupons.php", {
        method: "DELETE",
        auth: true,
        query: { id: String(id) },
      });
      toast.show("কুপন মুছে ফেলা হয়েছে");
      loadCoupons();
    } catch (e: any) {
      toast.show(e.message || "মুছে ফেলতে ব্যর্থ");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" /> কুপন কোড ব্যবস্থাপনা (Coupons)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            ডিসকাউন্ট কুপন তৈরি ও পরিচালনা করুন যা শিক্ষার্থীরা চেকআউটে ব্যবহার করতে পারবে।
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-bold shadow hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" /> নতুন কুপন যোগ করুন
        </button>
      </div>

      {/* Coupon List Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="p-4">কুপন কোড</th>
                <th className="p-4">ডিসকাউন্ট ধরন</th>
                <th className="p-4">ডিসকাউন্ট পরিমাণ</th>
                <th className="p-4">ব্যবহার / লিমিট</th>
                <th className="p-4">মেয়াদের তারিখ</th>
                <th className="p-4">স্ট্যাটাস</th>
                <th className="p-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    কোন কুপন তৈরি করা হয়নি। "নতুন কুপন যোগ করুন" বাটনে ক্লিক করে কুপন তৈরি করুন।
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20">
                        {c.code}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      {c.discount_type === "percent" ? (
                        <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded text-xs">
                          <Percent className="h-3 w-3" /> শতাংশ (%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-500/10 px-2 py-0.5 rounded text-xs">
                          <Banknote className="h-3 w-3" /> নির্দিষ্ট পরিমাণ (৳)
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {c.discount_type === "percent" ? `${c.discount_value}% ছাড়` : taka(c.discount_value)}
                    </td>
                    <td className="p-4 text-xs font-mono">
                      {c.used_count} / {c.max_uses ? c.max_uses : "অসীমিত"}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {c.expiry_date ? c.expiry_date : "আজীবন মেয়াদী"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.is_active
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {c.is_active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {c.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New Coupon */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" /> নতুন কুপন কোড তৈরি করুন
              </h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  কুপন কোড (যেমন: SAVE500) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="যেমন: SAVE500"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">ডিসকাউন্ট ধরন</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold"
                  >
                    <option value="fixed">নির্দিষ্ট টাকা (৳)</option>
                    <option value="percent">শতকরা (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    পরিমাণ <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    placeholder={form.discount_type === "percent" ? "যেমন: 10" : "যেমন: 500"}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">সর্বোচ্চ ব্যবহার (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    placeholder="যেমন: 100"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">মেয়াদের তারিখ (ঐচ্ছিক)</label>
                  <input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold shadow hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? "তৈরি হচ্ছে..." : "কুপন সেভ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
