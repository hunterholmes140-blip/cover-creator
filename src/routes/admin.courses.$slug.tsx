import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useLiveCourses } from "@/lib/live-store";
import { CourseForm, emptyCourse, type CourseFormValue } from "@/lib/course-form";
import { resolveBadge, setBadgeOverride } from "@/lib/course-badges";
import { PageHeader, Button, useToast } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/courses/$slug")({
  component: EditCoursePage,
});

function EditCoursePage() {
  const { slug } = Route.useParams();
  const { items, update, loading } = useLiveCourses();
  const toast = useToast();
  const navigate = useNavigate();
  const course = items.find((c: any) => c.slug === slug);

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title={loading ? "লোড হচ্ছে…" : "কোর্স পাওয়া যায়নি"} />
        <Link to="/admin/courses">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" /> কোর্স লিস্টে ফিরে যান
          </Button>
        </Link>
      </div>
    );
  }

  const badge = resolveBadge(course);
  let parsedBadge = course.badge && typeof course.badge === "object" ? course.badge : null;
  if (!parsedBadge && course.badge && typeof course.badge === "string") {
    try { parsedBadge = JSON.parse(course.badge); } catch {}
  }
  const initial: CourseFormValue = {
    ...emptyCourse,
    ...course,
    badge: parsedBadge || badge || null,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="কোর্স এডিট"
        subtitle={course.title}
        actions={
          <Link to="/admin/courses">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> ফিরে যান
            </Button>
          </Link>
        }
      />
      <CourseForm
        initial={initial}
        submitLabel="আপডেট করুন"
        onSubmit={async (v) => {
          try {
            setBadgeOverride(v.slug, v.badge);
            await update((course as any).id, v);
            toast.show("আপডেট হয়েছে");
            setTimeout(() => navigate({ to: "/admin/courses" }), 500);
          } catch (e: any) {
            toast.show(e?.message || "আপডেট ব্যর্থ");
          }
        }}
      />
      {toast.node}
    </div>
  );
}
