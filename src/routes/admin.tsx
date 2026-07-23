import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings, LayoutDashboard, BookOpen, Users, ShoppingCart, Film, Video,
  FolderTree, FileText, User, CreditCard, FilePenLine, Menu, X,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

type NavItem = { to: string; label: string; Icon: typeof Settings; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: "সাধারণ",
    items: [
      { to: "/admin", label: "ড্যাশবোর্ড", Icon: LayoutDashboard, exact: true },
      { to: "/admin/settings", label: "সাইট সেটিংস", Icon: Settings },
    ],
  },
  {
    label: "কন্টেন্ট",
    items: [
      { to: "/admin/homepage", label: "হোমপেজ টেক্সট", Icon: FilePenLine },
      { to: "/admin/hero", label: "হিরো ভিডিও", Icon: Film },
      { to: "/admin/videos", label: "ভিডিও গ্যালারি", Icon: Video },
      { to: "/admin/blog", label: "ব্লগ পোস্ট", Icon: FileText },
      { to: "/admin/testimonials", label: "টেস্টিমোনিয়াল", Icon: Users },
      { to: "/admin/faqs", label: "FAQ", Icon: FileText },
      { to: "/admin/pages", label: "পেইজ কন্টেন্ট", Icon: FilePenLine },
      { to: "/admin/footer", label: "ফুটার", Icon: FilePenLine },
    ],
  },
  {
    label: "কোর্স",
    items: [
      { to: "/admin/categories", label: "ক্যাটাগরি", Icon: FolderTree },
      { to: "/admin/courses", label: "কোর্স", Icon: BookOpen },
      { to: "/admin/trainers", label: "ট্রেনার", Icon: Users },
    ],
  },
  {
    label: "সেলস",
    items: [
      { to: "/admin/orders", label: "অর্ডার", Icon: ShoppingCart },
      { to: "/admin/users", label: "ইউজার", Icon: User },
      { to: "/admin/payments", label: "পেমেন্ট মেথড", Icon: CreditCard },
    ],
  },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const NavList = () => (
    <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {g.label}
          </div>
          <div className="space-y-0.5">
            {g.items.map(({ to, label, Icon, exact }) => {
              const active = isActive(to, exact);
              return (
                <Link
                  key={to}
                  to={to as any}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">
              A
            </div>
            <div>
              <div className="text-sm font-semibold">Admin Panel</div>
              <div className="text-xs text-muted-foreground">NextScale</div>
            </div>
          </Link>
        </div>
        <NavList />
        <div className="p-3 border-t border-border">
          <Link to="/" className="block text-xs text-muted-foreground hover:text-foreground">
            ← সাইটে ফিরে যান
          </Link>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-72 h-full bg-card border-r border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-semibold text-sm">Admin Panel</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavList />
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="md:hidden bg-card border-b border-border p-3 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-md border border-border"
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="font-semibold text-sm">Admin Panel</span>
        </div>
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
