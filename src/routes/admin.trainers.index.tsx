import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Star, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { useTrainers } from "@/lib/admin-store";
import { PageHeader, Card, Button, ConfirmDialog, useToast, Empty, Badge } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/trainers/")({
  component: TrainersList,
});

function TrainersList() {
  const { items, replaceAll, remove, saveNow } = useTrainers();
  const toast = useToast();
  const [confirmId, setConfirmId] = useState<any>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const setAsMentor = async (id: any, on: boolean) => {
    // Rebuild list in a single atomic write so only one head mentor stays.
    const next = items.map((t: any) => ({
      ...t,
      is_mentor: t.id === id ? (on ? 1 : 0) : 0,
    }));
    replaceAll(next);
    await saveNow(); // push to server immediately
    toast.show(on ? "প্রধান মেন্টর সেট হয়েছে (সাইটে রিফ্রেশ দিলে দেখা যাবে)" : "মেন্টর সরানো হয়েছে");
  };

  const moveItem = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    replaceAll(next);
    await saveNow();
    toast.show("ট্রেনারের সিকোয়েন্স/অর্ডার আপডেট করা হয়েছে");
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    await moveItem(draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="ট্রেনার ম্যানেজমেন্ট"
        subtitle={`${items.length} জন ট্রেনার/মেন্টর। মাউস দিয়ে ড্রাগ অথবা তীর চিহ্নে ক্লিক করে ক্রমানুসার সাজাতে পারেন।`}
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
        <div className="space-y-3">
          {items.map((t: any, index: number) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index && draggedIndex !== index;

            return (
              <div
                key={t.id || index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-200 ${
                  isDragging ? "opacity-40 scale-[0.99]" : ""
                } ${
                  isDragOver ? "ring-2 ring-primary ring-offset-2 rounded-xl bg-primary/5" : ""
                }`}
              >
                <Card className="flex items-center gap-3 p-4 hover:shadow-md transition-shadow">
                  {/* Drag Handle */}
                  <div
                    className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
                    title="ড্রাগ করে পজিশন চেঞ্জ করুন"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Position Badge */}
                  <div className="h-7 w-7 rounded-lg bg-muted text-muted-foreground font-mono text-xs font-bold grid place-items-center shrink-0">
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.name} className="h-12 w-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center font-bold text-primary shrink-0">
                      {t.name?.charAt(0)}
                    </div>
                  )}

                  {/* Info */}
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

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Up/Down buttons for quick ordering */}
                    <div className="flex flex-col gap-0.5 mr-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveItem(index, index - 1)}
                        className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent text-muted-foreground"
                        title="উপরে তুলুন"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => moveItem(index, index + 1)}
                        className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent text-muted-foreground"
                        title="নিচে নামান"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

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
              </div>
            );
          })}
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
