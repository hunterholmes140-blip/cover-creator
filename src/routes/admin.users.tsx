import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, Search, Save, FileText, Check } from "lucide-react";
import { useLiveUsers } from "@/lib/live-store";
import { PageHeader, Card, Input, Button, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const { items, remove, loading, error, update } = useLiveUsers();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<any>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return items;
    return items.filter(
      (u: any) =>
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.phone?.includes(s) ||
        u.note?.toLowerCase().includes(s),
    );
  }, [items, q]);

  const handleSaveNote = async (id: number, noteText: string) => {
    setSavingId(id);
    try {
      if (update) {
        await update(id, { note: noteText });
      } else {
        await api("admin/users.php", {
          method: "PUT",
          body: { id, note: noteText },
        });
      }
      setSavedId(id);
      toast.show("নোট সেভ হয়েছে 📝");
      setTimeout(() => setSavedId((prev) => (prev === id ? null : prev)), 2500);
    } catch (err: any) {
      toast.show("নোট সেভ হতে সমস্যা হয়েছে");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader title="ইউজার ম্যানেজমেন্ট" subtitle={`মোট ${items.length} জন ইউজার।`} />

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="নাম, ইমেইল, ফোন বা নোট দিয়ে সার্চ..." className="pl-9" />
      </div>

      {loading && items.length === 0 ? (
        <Card><div className="p-6 text-sm text-muted-foreground text-center">লোড হচ্ছে…</div></Card>
      ) : filtered.length === 0 ? (
        <Empty title="কোনো ইউজার নেই।" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3 font-medium">নাম</th>
                  <th className="p-3 font-medium">ইমেইল</th>
                  <th className="p-3 font-medium">ফোন</th>
                  <th className="p-3 font-medium">নোট (অ্যাডমিন রিমার্কস)</th>
                  <th className="p-3 font-medium">কোর্স</th>
                  <th className="p-3 font-medium">জয়েন</th>
                  <th className="p-3 font-medium text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u: any) => {
                  const currentNote = notes[u.id] !== undefined ? notes[u.id] : (u.note || "");
                  const isNoteDirty = notes[u.id] !== undefined && notes[u.id] !== (u.note || "");
                  const isSaved = savedId === u.id;
                  const isSaving = savingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="p-3 font-semibold text-foreground">{u.name}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">{u.phone || "N/A"}</td>

                      {/* Note Column */}
                      <td className="p-3 min-w-[240px]">
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <Input
                              value={currentNote}
                              onChange={(e) => setNotes({ ...notes, [u.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveNote(u.id, currentNote);
                                }
                              }}
                              placeholder="নোট লিখুন (যেমন: পেমেন্ট ওকে...)"
                              className="text-xs py-1.5 h-8 pr-2"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant={isSaved ? "secondary" : isNoteDirty ? "primary" : "secondary"}
                            onClick={() => handleSaveNote(u.id, currentNote)}
                            disabled={isSaving}
                            className="h-8 px-2.5 shrink-0"
                            title="সর্বশেষ নোট সেভ করুন"
                          >
                            {isSaving ? (
                              "..."
                            ) : isSaved ? (
                              <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                                <Check className="h-3.5 w-3.5" /> সেভড
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Save className="h-3.5 w-3.5" /> সেভ
                              </span>
                            )}
                          </Button>
                        </div>
                      </td>

                      <td className="p-3 font-semibold">{u.enrolled_count ?? u.course_count ?? 0}</td>
                      <td className="p-3 text-xs text-muted-foreground">{u.created_at}</td>
                      <td className="p-3 text-right">
                        <Button size="sm" variant="danger" onClick={() => setConfirmId(u.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
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
        onConfirm={async () => {
          try { await remove(confirmId); toast.show("ডিলিট হয়েছে"); }
          catch (e: any) { toast.show(e?.message || "ডিলিট ব্যর্থ"); }
        }}
      />
      {toast.node}
    </div>
  );
}
