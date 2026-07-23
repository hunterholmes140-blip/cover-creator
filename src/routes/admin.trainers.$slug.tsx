import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTrainers } from "@/lib/admin-store";
import { TrainerForm, emptyTrainer, type TrainerFormValue } from "@/lib/trainer-form";
import { PageHeader, Button, useToast } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/trainers/$slug")({
  component: EditTrainer,
});

function EditTrainer() {
  const { slug } = Route.useParams();
  const { items, update } = useTrainers();
  const toast = useToast();
  const navigate = useNavigate();
  const trainer = items.find((t: any) => t.slug === slug);

  if (!trainer) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="ট্রেনার পাওয়া যায়নি" />
        <Link to="/admin/trainers">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" /> ফিরে যান
          </Button>
        </Link>
      </div>
    );
  }

  const initial: TrainerFormValue = { ...emptyTrainer, ...trainer, social: trainer.social ?? {} };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="ট্রেনার এডিট"
        subtitle={trainer.name}
        actions={
          <Link to="/admin/trainers">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> ফিরে যান
            </Button>
          </Link>
        }
      />
      <TrainerForm
        initial={initial}
        submitLabel="আপডেট করুন"
        onSubmit={(v) => {
          update(trainer.id, v);
          toast.show("আপডেট হয়েছে");
          setTimeout(() => navigate({ to: "/admin/trainers" }), 500);
        }}
      />
      {toast.node}
    </div>
  );
}
