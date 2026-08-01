import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, Search, Save, Check, BookOpen, X, ShieldCheck, Plus } from "lucide-react";
import { useLiveUsers, useLiveCourses } from "@/lib/live-store";
import { PageHeader, Card, Input, Button, ConfirmDialog, useToast, Empty } from "@/components/admin/ui";
import { api } from "@/lib/api";
import { taka } from "@/lib/format";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const { items, remove, loading, error, update, refresh } = useLiveUsers();
  const { items: liveCourses } = useLiveCourses();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<any>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  // Modal State for Manual Course Activation
  const [activeModalUser, setActiveModalUser] = useState<any | null>(null);
  const [loadingModalData, setLoadingModalData] = useState(false);
  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

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
          auth: true,
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

  const openCourseModal = async (user: any) => {
    setActiveModalUser(user);
    setLoadingModalData(true);

    // Immediate fallback with liveCourses from store
    if (liveCourses && liveCourses.length > 0) {
      setAllCourses(liveCourses);
    }

    try {
      const res = await api("admin/users.php", {
        method: "POST",
        body: { user_id: user.id, action: "list" },
        auth: true,
      }).catch(() => null);

      let fetchedEnrollments = res?.enrollments || [];
      let fetchedCourses = res?.all_courses || [];

      if (!fetchedCourses || fetchedCourses.length === 0) {
        if (liveCourses && liveCourses.length > 0) {
          fetchedCourses = liveCourses;
        } else {
          const coursesRes = await api("admin/courses.php", { auth: true }).catch(() => null);
          if (coursesRes?.courses && coursesRes.courses.length > 0) {
            fetchedCourses = coursesRes.courses;
          }
        }
      }

      setUserEnrollments(fetchedEnrollments);
      if (fetchedCourses && fetchedCourses.length > 0) {
        setAllCourses(fetchedCourses);
      }
    } catch (err: any) {
      console.error("Course list error:", err);
      if (liveCourses && liveCourses.length > 0) {
        setAllCourses(liveCourses);
      }
    } finally {
      setLoadingModalData(false);
    }
  };

  const handleToggleCourse = async (courseId: number, isCurrentlyEnrolled: boolean) => {
    if (!activeModalUser) return;
    setActionInProgress(courseId);
    try {
      const action = isCurrentlyEnrolled ? "unenroll" : "enroll";
      await api("admin/users.php", {
        method: "POST",
        body: { user_id: activeModalUser.id, course_id: courseId, action },
        auth: true,
      });

      if (isCurrentlyEnrolled) {
        setUserEnrollments((prev) => prev.filter((e) => Number(e.course_id) !== Number(courseId)));
        toast.show("কোর্স এক্সেস রিমুভ করা হয়েছে ❌");
      } else {
        const c = allCourses.find((item) => Number(item.id) === Number(courseId));
        setUserEnrollments((prev) => [...prev, { course_id: courseId, course_title: c?.title || "" }]);
        toast.show("কোর্স ম্যানুয়ালি এক্টিভ করা হয়েছে 🚀");
      }

      if (refresh) refresh();
    } catch (err: any) {
      toast.show(err?.message || "অপারেশন ব্যর্থ হয়েছে");
    } finally {
      setActionInProgress(null);
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

                      <td className="p-3">
                        <span className="font-bold text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {u.enrolled_count ?? u.course_count ?? 0} টি
                        </span>
                      </td>

                      <td className="p-3 text-xs text-muted-foreground">{u.created_at}</td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openCourseModal(u)}
                            className="h-8 text-xs font-semibold px-2.5"
                            title="ইউজারকে ম্যানুয়ালি কোর্স এক্টিভ / এনরোল করুন"
                          >
                            <BookOpen className="h-3.5 w-3.5" /> কোর্স এক্টিভ
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setConfirmId(u.id)}>
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

      {/* 📚 Manual Course Activation Popup Modal */}
      {activeModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setActiveModalUser(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground text-lg font-bold h-8 w-8 rounded-full bg-muted flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> ম্যানুয়াল কোর্স এক্টিভেশন
              </h3>
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <p><span className="font-semibold text-foreground">ইউজার:</span> {activeModalUser.name}</p>
                <p><span className="font-semibold text-foreground">ইমেইল:</span> {activeModalUser.email} {activeModalUser.phone && `• ${activeModalUser.phone}`}</p>
              </div>
            </div>

            {loadingModalData && allCourses.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">কোর্স তালিকা লোড হচ্ছে...</div>
            ) : allCourses.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">কোনো কোর্স পাওয়া যায়নি।</div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">উপলব্ধ কোর্সসমূহ</div>
                <div className="space-y-2">
                  {allCourses.map((c: any) => {
                    const isEnrolled = userEnrollments.some((e) => Number(e.course_id) === Number(c.id));
                    const isWorking = actionInProgress === c.id;

                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          isEnrolled
                            ? "border-green-500/30 bg-green-500/5 dark:bg-green-500/10"
                            : "border-border bg-muted/20 hover:border-primary/30"
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <h4 className="font-semibold text-sm text-foreground leading-snug">{c.title}</h4>
                          <div className="text-xs text-muted-foreground font-mono">
                            মূল্য: <span className="font-bold text-primary">{taka(c.discount_price || c.price || 0)}</span>
                          </div>
                        </div>

                        <div>
                          {isEnrolled ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-green-600 bg-green-500/15 px-2.5 py-1 rounded-md flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5" /> এক্টিভ
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleCourse(c.id, true)}
                                disabled={isWorking}
                                className="h-7 text-xs text-destructive hover:bg-destructive/10 px-2"
                                title="কোর্স এক্সেস বাতিল করুন"
                              >
                                {isWorking ? "..." : <X className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleToggleCourse(c.id, false)}
                              disabled={isWorking}
                              className="h-8 text-xs font-semibold px-3"
                            >
                              {isWorking ? "এক্টিভ হচ্ছে..." : <><Plus className="h-3.5 w-3.5 mr-1" /> এক্টিভ করুন</>}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 text-right border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setActiveModalUser(null)}>
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
