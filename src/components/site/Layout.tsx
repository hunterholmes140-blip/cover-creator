import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, User, LogOut, ShoppingBag } from "lucide-react";
import { clearAuth, getStoredUser } from "@/lib/api";

const NAV = [
  { to: "/", label: "হোম" },
  { to: "/courses", label: "কোর্স" },
  { to: "/trainers", label: "ট্রেনার" },
  { to: "/blog", label: "ব্লগ" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "আমাদের সম্পর্কে" },
  { to: "/contact", label: "যোগাযোগ" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">
              N
            </div>
            <span className="text-lg font-bold text-foreground">NextScale</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                activeProps={{ className: "px-3 py-2 text-sm font-medium text-primary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
                >
                  <User className="h-4 w-4" /> {user.name}
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-destructive"
                  aria-label="লগআউট"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-primary">
                  লগইন
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  রেজিস্টার
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3 space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-border flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium bg-accent">
                      ড্যাশবোর্ড ({user.name})
                    </Link>
                    <button onClick={logout} className="text-left px-3 py-2 text-sm text-destructive">
                      লগআউট
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium border border-border text-center">
                      লগইন
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm font-semibold bg-primary text-primary-foreground text-center">
                      রেজিস্টার
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted/30 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">N</div>
              <span className="text-lg font-bold">NextScale Academy</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              বাংলাদেশের অগ্রণী অনলাইন লার্নিং প্ল্যাটফর্ম। ইন্ডাস্ট্রি এক্সপার্টদের কাছ থেকে শিখুন এবং ক্যারিয়ার গড়ুন।
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">কুইক লিংক</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/courses" className="hover:text-primary">সব কোর্স</Link></li>
              <li><Link to="/about" className="hover:text-primary">আমাদের সম্পর্কে</Link></li>
              <li><Link to="/contact" className="hover:text-primary">যোগাযোগ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">যোগাযোগ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📧 info@nextscale.com</li>
              <li>📞 +৮৮০ ১৭০০-০০০০০০</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} NextScale Academy. সর্বস্বত্ব সংরক্ষিত।
          </div>
        </div>
      </footer>
    </div>
  );
}
