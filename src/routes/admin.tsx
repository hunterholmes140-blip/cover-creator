import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Settings, LayoutDashboard, BookOpen, Users, ShoppingCart, Film, Video,
  FolderTree, FileText, User, CreditCard, FilePenLine, Menu, X, LogOut, Lock, Megaphone,
  BarChart3, Tag,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminGate,
});

function AdminGate() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("nextscale_token");
    const u = localStorage.getItem("nextscale_user");
    try {
      const user = u ? JSON.parse(u) : null;
      setAuthed(!!t && user?.role === "admin");
    } catch {
      setAuthed(false);
    }
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!authed) return <AdminLogin onDone={() => setAuthed(true)} />;
  return <AdminLayout onLogout={() => { localStorage.removeItem("nextscale_token"); localStorage.removeItem("nextscale_user"); setAuthed(false); }} />;
}

function AdminLogin({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("admin@nextscale.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/admin-login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.error || "লগইন ব্যর্থ");
      const data = json.data ?? json;
      localStorage.setItem("nextscale_token", data.token);
      localStorage.setItem("nextscale_user", JSON.stringify(data.user));
      onDone();
    } catch (e: any) {
      setErr(e?.message || "লগইন ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">Admin Login</div>
            <div className="text-xs text-muted-foreground">NextScale অ্যাডমিন প্যানেল</div>
          </div>
        </div>
        <label className="block text-sm">
          <span className="text-foreground/80">ইমেইল</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <label className="block text-sm">
          <span className="text-foreground/80">পাসওয়ার্ড</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button disabled={loading} className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
          {loading ? "লগইন হচ্ছে..." : "লগইন"}
        </button>
        <p className="text-xs text-muted-foreground">
          ডিফল্ট: admin@nextscale.com / admin123
        </p>
      </form>
    </div>
  );
}


type NavItem = { to: string; label: string; Icon: typeof Settings; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: "সাধারণ",
    items: [
      { to: "/admin", label: "ড্যাশবোর্ড", Icon: LayoutDashboard, exact: true },
      { to: "/admin/settings", label: "সাইট সেটিংস", Icon: Settings },
      { to: "/admin/marketing", label: "মার্কেটিং / Pixel", Icon: Megaphone },
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
      { to: "/admin/auth-pages", label: "লগইন/রেজিস্টার", Icon: Lock },
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
      { to: "/admin/analytics", label: "সেলস এনালাইটিক্স", Icon: BarChart3 },
      { to: "/admin/coupons", label: "কুপন কোড", Icon: Tag },
      { to: "/admin/users", label: "ইউজার", Icon: User },
      { to: "/admin/payments", label: "পেমেন্ট মেথড", Icon: CreditCard },
    ],
  },
];

function AdminLayout({ onLogout }: { onLogout: () => void }) {
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
        <div className="p-3 border-t border-border space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-xs text-red-600 hover:text-red-700"
          >
            <LogOut className="h-3.5 w-3.5" /> লগআউট
          </button>
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
