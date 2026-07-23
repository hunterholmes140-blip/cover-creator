import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, ShoppingBag, Clock, CheckCircle2, XCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { api, getStoredUser } from "@/lib/api";
import { taka } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "ড্যাশবোর্ড — NextScale" },
      { name: "description", content: "আপনার কোর্স ও অর্ডার হিস্ট্রি।" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const nav = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"courses" | "orders">("courses");
  const [courses, setCourses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      nav({ to: "/login" });
      return;
    }
    setUser(u);
    Promise.all([
      api<{ courses: any[] }>("courses/my-courses.php", { auth: true }).catch(() => ({ courses: [] })),
      api<{ orders: any[] }>("orders/my-orders.php", { auth: true }).catch(() => ({ orders: [] })),
    ]).then(([c, o]) => {
      setCourses(c.courses);
      setOrders(o.orders);
      setLoading(false);
    });
  }, [nav]);

  if (!user) return null;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-sm text-muted-foreground">স্বাগতম</div>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">{user.name}</h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 border-b border-border">
          <TabBtn active={tab === "courses"} onClick={() => setTab("courses")} icon={BookOpen} label="আমার কোর্স" />
          <TabBtn active={tab === "orders"} onClick={() => setTab("orders")} icon={ShoppingBag} label="অর্ডার হিস্ট্রি" />
        </div>

        <div className="py-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">লোড হচ্ছে...</div>
          ) : tab === "courses" ? (
            courses.length === 0 ? (
              <EmptyState title="কোনো কোর্স নেই" desc="এখনো কোনো কোর্সে ভর্তি হননি।" cta="সব কোর্স দেখুন" href="/courses" />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{c.instructor}</p>
                    <Link to="/courses/$slug" params={{ slug: c.slug }} className="mt-4 inline-block text-sm text-primary font-medium hover:underline">
                      কোর্স শুরু করুন →
                    </Link>
                  </div>
                ))}
              </div>
            )
          ) : orders.length === 0 ? (
            <EmptyState title="কোনো অর্ডার নেই" desc="এখনো কোনো কোর্স অর্ডার করেননি।" cta="কোর্স ব্রাউজ করুন" href="/courses" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 pr-4">কোর্স</th>
                    <th className="py-3 pr-4">অ্যামাউন্ট</th>
                    <th className="py-3 pr-4">মেথড</th>
                    <th className="py-3 pr-4">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 pr-4">{o.course_title}</td>
                      <td className="py-3 pr-4">{taka(o.amount)}</td>
                      <td className="py-3 pr-4 uppercase text-xs">{o.payment_method}</td>
                      <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function EmptyState({ title, desc, cta, href }: any) {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <Link to={href} className="mt-4 inline-flex rounded-lg bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold">{cta}</Link>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; l: string; I: any }> = {
    pending: { c: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500", l: "পেন্ডিং", I: Clock },
    approved: { c: "bg-green-500/10 text-green-700 dark:text-green-500", l: "অনুমোদিত", I: CheckCircle2 },
    rejected: { c: "bg-destructive/10 text-destructive", l: "বাতিল", I: XCircle },
  };
  const s = map[status] ?? map.pending;
  const I = s.I;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.c}`}>
      <I className="h-3 w-3" /> {s.l}
    </span>
  );
}
