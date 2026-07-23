import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Settings, LayoutDashboard, BookOpen, Users, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "ড্যাশবোর্ড", Icon: LayoutDashboard, exact: true },
  { to: "/admin/settings", label: "সাইট সেটিংস", Icon: Settings },
  { to: "/admin/courses", label: "কোর্স", Icon: BookOpen },
  { to: "/admin/trainers", label: "ট্রেনার", Icon: Users },
  { to: "/admin/orders", label: "অর্ডার", Icon: ShoppingCart },
] as const satisfies ReadonlyArray<{ to: string; label: string; Icon: typeof Settings; exact?: boolean }>;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-64 shrink-0 bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">A</div>
            <div>
              <div className="text-sm font-semibold">Admin Panel</div>
              <div className="text-xs text-muted-foreground">NextScale</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link to="/" className="block text-xs text-muted-foreground hover:text-foreground">← সাইটে ফিরে যান</Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="md:hidden bg-card border-b border-border p-3 flex gap-2 overflow-x-auto">
          {NAV.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs whitespace-nowrap">
              <Icon className="h-3.5 w-3.5" /> {label}
            </Link>
          ))}
        </div>
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
