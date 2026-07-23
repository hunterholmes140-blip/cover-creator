import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { useTrainers } from "@/lib/admin-store";
import { PageHeader, Card, Button, ConfirmDialog, useToast, Empty, Badge } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/trainers/")({
  component: TrainersList,
});

function TrainersList() {
  const { items, replaceAll, remove, saveNow } = useTrainers();
  const toast = useToast();
  const [confirmId, setConfirmId] = useState<any>(null);

  const setAsMentor = async (id: any, on: boolean) => {
    // Rebuild list in a single atomic write so only one head mentor stays.
    const next = items.map((t: any) => ({
      ...t,
      is_mentor: t.id === id ? (on ? 1 : 0) : 0,
    }));
    replaceAll(next);
    await saveNow(); // push to server immediately, no debounce race
    toast.show(on ? "প্রধান মেন্টর সেট হয়েছে (সাইটে রিফ্রেশ দিলে দেখা যাবে)" : "মেন্টর সরানো হয়েছে");
  };



  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="ট্রেনার ম্যানেজমেন্ট"
        subtitle={`${items.length} জন ট্রেনার/মেন্টর।`}
        actions={
          <Link to="/admin/trainers/new">
            <Button>
              <Plus className="h-4 w-4" /> নতুন ট্রেনার
            </Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <Empty title="এখনো কোনো ট্রেনার নেই।" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((t: any) => (
            <Card key={t.id} className="flex items-center gap-4">
              {t.avatar_url ? (
                <img src={t.avatar_url} alt={t.name} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-primary/10 grid place-items-center font-bold text-primary">
                  {t.name?.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate flex items-center gap-2">
                  {t.name}
                  {t.is_mentor && <Badge color="amber"><Star className="h-3 w-3 mr-0.5 inline" />Mentor</Badge>}
                </div>
                <div className="text-xs text-muted-foreground truncate">{t.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t.students ?? 0}+ শিক্ষার্থী · {t.courses ?? 0} কোর্স
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Link to="/admin/trainers/$slug" params={{ slug: t.slug }}>
                  <Button size="sm" variant="secondary">
                    <Pencil className="h-3 w-3" /> এডিট
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setAsMentor(t.id, !t.is_mentor)}
                  title="প্রধান মেন্টর টগল"
                >
                  <Star className="h-3 w-3" fill={t.is_mentor ? "currentColor" : "none"} />
                </Button>

                <Button size="sm" variant="danger" onClick={() => setConfirmId(t.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

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
