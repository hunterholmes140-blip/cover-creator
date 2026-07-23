import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useBlog } from "@/lib/admin-store";
import { BlogForm, emptyBlog } from "@/lib/blog-form";
import { PageHeader, Button } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/blog/new")({
  component: NewPost,
});

function NewPost() {
  const { add } = useBlog();
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="নতুন পোস্ট"
        actions={
          <Link to="/admin/blog">
            <Button variant="secondary"><ArrowLeft className="h-4 w-4" /> ফিরে যান</Button>
          </Link>
        }
      />
      <BlogForm
        initial={emptyBlog}
        submitLabel="পোস্ট প্রকাশ"
        onSubmit={(v) => {
          add(v);
          navigate({ to: "/admin/blog" });
        }}
      />
    </div>
  );
}
