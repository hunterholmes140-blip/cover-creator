import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useBlog } from "@/lib/admin-store";
import { BlogForm, emptyBlog, type BlogFormValue } from "@/lib/blog-form";
import { PageHeader, Button, useToast } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/blog/$slug")({
  component: EditBlog,
});

function EditBlog() {
  const { slug } = Route.useParams();
  const { items, update } = useBlog();
  const toast = useToast();
  const navigate = useNavigate();
  const post = items.find((p: any) => p.slug === slug);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="পোস্ট পাওয়া যায়নি" />
        <Link to="/admin/blog">
          <Button variant="secondary"><ArrowLeft className="h-4 w-4" /> ফিরে যান</Button>
        </Link>
      </div>
    );
  }

  const initial: BlogFormValue = { ...emptyBlog, ...post };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="পোস্ট এডিট"
        subtitle={post.title}
        actions={
          <Link to="/admin/blog">
            <Button variant="secondary"><ArrowLeft className="h-4 w-4" /> ফিরে যান</Button>
          </Link>
        }
      />
      <BlogForm
        initial={initial}
        submitLabel="আপডেট"
        onSubmit={(v) => {
          update(post.id, v);
          toast.show("আপডেট হয়েছে");
          setTimeout(() => navigate({ to: "/admin/blog" }), 500);
        }}
      />
      {toast.node}
    </div>
  );
}
