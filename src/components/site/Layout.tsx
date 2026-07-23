import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, User, LogOut, Facebook, Youtube, Instagram, Linkedin, MessageCircle } from "lucide-react";
import { clearAuth, getStoredUser } from "@/lib/api";
import { useSiteSettings, whatsappLink } from "@/lib/site-settings";
import paymentsStrip from "@/assets/payments-strip.png.asset.json";
import brandLogo from "@/assets/brand-logo.png.asset.json";



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
  const { settings } = useSiteSettings();
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
            <img src={brandLogo.url} alt={settings.brandName} className="h-9 w-9 object-contain" />
            <span className="text-lg font-bold text-foreground">{settings.brandName}</span>
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

      <footer
        className="relative mt-20 text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${settings.footerFrom} 0%, ${settings.footerVia} 45%, ${settings.footerTo} 100%)`,
        }}
      >
        {/* decorative glows */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:pr-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-white text-primary grid place-items-center font-bold shadow-md">
                  {settings.brandName.charAt(0)}
                </div>
                <span className="text-2xl font-extrabold tracking-tight">{settings.brandName}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/75">{settings.brandTagline}</p>
              <div className="mt-5 flex items-center gap-3">
                {[
                  { Icon: Facebook, label: "Facebook", href: settings.facebookUrl },
                  { Icon: Youtube, label: "YouTube", href: settings.youtubeUrl },
                  { Icon: Instagram, label: "Instagram", href: settings.instagramUrl },
                  { Icon: Linkedin, label: "LinkedIn", href: settings.linkedinUrl },
                ].map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href || "#"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white hover:text-primary transition-colors ring-1 ring-white/15"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-bold mb-4">কোম্পানি</h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li><Link to="/about" className="hover:text-white transition-colors">আমাদের সম্পর্কে</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white transition-colors">রিফান্ড পলিসি</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">প্রাইভেসি পলিসি</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">শর্তাবলী</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4">যোগাযোগ</h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li>
                  <a
                    href={whatsappLink(settings.whatsappNumber)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp চ্যাট
                  </a>
                </li>
                <li><a href={`tel:${settings.phoneNumber}`} className="hover:text-white transition-colors">{settings.phoneNumber}</a></li>
                <li><a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">{settings.email}</a></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">যোগাযোগ পেজ</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">কুইক লিংক</h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li><Link to="/affiliate" className="hover:text-white transition-colors">অ্যাফিলিয়েট অ্যাকাউন্ট</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">সব কোর্স</Link></li>
                <li><Link to="/free-courses" className="hover:text-white transition-colors">ফ্রি কোর্স</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">ব্লগ</Link></li>
              </ul>
            </div>
          </div>

          {/* Payment strip */}
          <div className="mt-12 pt-8 border-t border-white/15">
            <div className="rounded-xl bg-white p-3 sm:p-4 shadow-sm overflow-hidden">
              <img
                src={paymentsStrip.url}
                alt="Accepted payment methods — Visa, Mastercard, bKash, Nagad, Rocket, DBBL, MTB, SSLCommerz সহ"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>


          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
            <p>© {new Date().getFullYear()} {settings.brandName} Academy. সর্বস্বত্ব সংরক্ষিত।</p>
            <p>Made with ❤️ in Bangladesh</p>
          </div>
        </div>
      </footer>


    </div>
  );
}
