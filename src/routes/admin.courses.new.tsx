import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useLiveCourses } from "@/lib/live-store";
import { CourseForm, emptyCourse } from "@/lib/course-form";
import { PageHeader, Button, useToast } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/courses/new")({
  component: NewCoursePage,
});

function NewCoursePage() {
  const { add } = useLiveCourses();
  const toast = useToast();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="নতুন কোর্স"
        subtitle="কোর্সের সব তথ্য পূরণ করে সেভ করুন।"
        actions={
          <Link to="/admin/courses">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> ফিরে যান
            </Button>
          </Link>
        }
      />
      <CourseForm
        initial={emptyCourse}
        submitLabel="কোর্স তৈরি করুন"
        onSubmit={async (v) => {
          try {
            await add(v);
            navigate({ to: "/admin/courses" });
          } catch (e: any) {
            toast.show(e?.message || "সেভ ব্যর্থ");
          }
        }}
      />
      {toast.node}
    </div>
  );
}
