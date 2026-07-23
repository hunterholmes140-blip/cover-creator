import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen, Users, ShoppingCart, DollarSign, FileText, Video, User, FolderTree,
} from "lucide-react";
import {
  useCourses, useTrainers, useOrders, useUsers, useBlog, useVideos, useCategories,
} from "@/lib/admin-store";
import { taka } from "@/lib/format";
import { Card, PageHeader, Badge } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { items: courses } = useCourses();
  const { items: trainers } = useTrainers();
  const { items: orders } = useOrders();
  const { items: users } = useUsers();
  const { items: blog } = useBlog();
  const { items: videos } = useVideos();
  const { items: categories } = useCategories();

  const revenue = orders
    .filter((o: any) => o.status === "approved")
    .reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === "pending").length;

  const kpi = [
    { label: "মোট কোর্স", value: courses.length, Icon: BookOpen, color: "text-blue-500" },
    { label: "মোট ইউজার", value: users.length, Icon: User, color: "text-emerald-500" },
    { label: "মোট অর্ডার", value: orders.length, Icon: ShoppingCart, color: "text-amber-500" },
    { label: "মোট রেভিনিউ", value: taka(revenue), Icon: DollarSign, color: "text-primary" },
  ];

  const quick = [
    { to: "/admin/courses", label: "কোর্স", count: courses.length, Icon: BookOpen },
    { to: "/admin/trainers", label: "ট্রেনার", count: trainers.length, Icon: Users },
    { to: "/admin/orders", label: "অর্ডার", count: orders.length, Icon: ShoppingCart, badge: pendingOrders ? `${pendingOrders} pending` : undefined },
    { to: "/admin/users", label: "ইউজার", count: users.length, Icon: User },
    { to: "/admin/blog", label: "ব্লগ", count: blog.length, Icon: FileText },
    { to: "/admin/videos", label: "ভিডিও", count: videos.length, Icon: Video },
    { to: "/admin/categories", label: "ক্যাটাগরি", count: categories.length, Icon: FolderTree },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="অ্যাডমিন ড্যাশবোর্ড"
        subtitle="আপনার সাইটের সব কিছু এক জায়গা থেকে নিয়ন্ত্রণ করুন।"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map((k) => (
          <Card key={k.label} className="flex items-center gap-4">
            <div className={`h-11 w-11 rounded-lg bg-primary/10 grid place-items-center ${k.color}`}>
              <k.Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-xl font-bold">{k.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        দ্রুত ম্যানেজমেন্ট
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quick.map((q) => (
          <Link
            key={q.to}
            to={q.to as any}
            className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/40 transition"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <q.Icon className="h-5 w-5" />
              </div>
              {"badge" in q && q.badge && <Badge color="amber">{q.badge}</Badge>}
            </div>
            <div className="mt-3 font-semibold">{q.label}</div>
            <div className="text-sm text-muted-foreground">{q.count} টি আইটেম</div>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        সাম্প্রতিক অর্ডার
      </h2>
      <Card className="p-0 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground text-center">কোনো অর্ডার নেই।</div>
        ) : (
          <div className="divide-y divide-border">
            {orders.slice(0, 5).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-4 gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{o.user_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{o.course_title}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold">{taka(o.amount)}</span>
                  <Badge color={o.status === "approved" ? "green" : o.status === "pending" ? "amber" : "red"}>
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
