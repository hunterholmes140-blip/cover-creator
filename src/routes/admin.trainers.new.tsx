import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTrainers } from "@/lib/admin-store";
import { TrainerForm, emptyTrainer } from "@/lib/trainer-form";
import { PageHeader, Button } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/trainers/new")({
  component: NewTrainerPage,
});

function NewTrainerPage() {
  const { add } = useTrainers();
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="নতুন ট্রেনার"
        actions={
          <Link to="/admin/trainers">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> ফিরে যান
            </Button>
          </Link>
        }
      />
      <TrainerForm
        initial={emptyTrainer}
        submitLabel="তৈরি করুন"
        onSubmit={(v) => {
          add(v);
          navigate({ to: "/admin/trainers" });
        }}
      />
    </div>
  );
}
