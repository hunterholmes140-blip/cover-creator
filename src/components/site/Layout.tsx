import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, User, LogOut, Facebook, Youtube, Instagram, Linkedin, MessageCircle, ChevronDown } from "lucide-react";
import { clearAuth, getStoredUser } from "@/lib/api";
import { useSiteSettings, whatsappLink } from "@/lib/site-settings";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useContent } from "@/lib/content-store";
import { FOOTER_CONTENT_DEFAULTS, CONTENT_KEYS } from "@/lib/content-defaults";
import { LanguageTranslator } from "./LanguageTranslator";
import paymentsStrip from "@/assets/payments-strip.png.asset.json";
import brandLogo from "@/assets/brand-logo.png.asset.json";



const TEAM_SUB_ITEMS = [
  { label: "Author", dept: "Author", desc: "অথর ও কোর্স কনটেন্ট টিম" },
  { label: "Management", dept: "Management", desc: "ম্যানেজমেন্ট ও প্রশাসন" },
  { label: "Sales", dept: "Sales", desc: "সেলস ও স্টুডেন্ট কাউন্সেলিং" },
  { label: "Logistics", dept: "Logistics", desc: "লজিস্টিকস ও ইনভেন্টরি" },
  { label: "Logictics Support", dept: "Logictics Support", desc: "লজিস্টিকস সাপোর্ট ও সমন্বয়" },
  { label: "Others", dept: "Others", desc: "আইটি ও সহায়ক অন্যান্য" },
] as const;

const NAV_START = [
  { to: "/", label: "হোম" },
  { to: "/courses", label: "কোর্স" },
  { to: "/trainers", label: "ট্রেনার" },
] as const;

const NAV_END = [
  { to: "/blog", label: "ব্লগ" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "আমাদের সম্পর্কে" },
  { to: "/contact", label: "যোগাযোগ" },
] as const;

function ThreadsIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 192 192" fill="currentColor">
      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.017 87.8451C137.587 73.123 129.569 63.8566 116.516 63.5359C104.912 63.2504 94.6713 70.8038 90.9634 81.6575C89.508 85.9189 88.8016 90.6272 88.8924 95.3941C89.043 103.35 92.4282 110.835 98.3496 116.143C104.271 121.452 112.213 124.12 120.355 123.541C130.407 122.827 138.835 116.671 142.179 107.014L159.227 113.111C154.075 127.971 141.139 137.423 125.688 138.528C113.197 139.422 100.999 135.327 91.9056 127.176C82.8122 119.026 77.6111 107.527 77.3797 95.3032C77.0782 79.3789 84.7797 64.913 97.4589 57.5755C110.138 50.238 125.751 51.1895 137.491 60.0152C149.231 68.8409 155.334 84.1843 153.155 99.4121C150.149 120.402 134.425 137.382 113.626 142.062C92.8276 146.741 71.0772 138.169 59.0062 120.526C46.9351 102.883 47.0182 79.4354 59.2152 61.8741C71.4122 44.3129 93.1873 35.8829 113.978 40.7107C126.973 43.7285 138.271 51.2721 145.89 62.0084L160.771 51.3418C150.812 37.3082 136.042 27.4475 119.055 23.5029C91.8785 17.1923 63.4146 28.2128 47.4705 51.1693C31.5264 74.1258 31.4177 104.776 47.1969 127.839C62.9761 150.902 91.408 162.107 118.599 155.99C145.79 149.873 166.345 127.676 170.274 100.24C173.238 79.5222 164.935 58.6477 148.962 46.6406C132.989 34.6335 111.748 33.3391 94.4965 43.3218C77.2452 53.3045 66.7675 72.9859 67.1777 94.6083C67.4925 111.238 74.5684 126.882 86.9405 137.971C99.3126 149.06 115.908 154.631 132.898 153.414L131.674 136.216C120.407 137.023 109.394 133.324 101.18 125.964C92.9658 118.604 88.2709 108.22 88.062 97.1852C87.8016 83.398 94.469 70.8762 105.446 64.5249C116.423 58.1736 129.937 58.9972 140.09 66.6373C150.243 74.2774 155.526 87.5592 153.64 100.742C151.054 118.805 137.525 133.414 119.638 137.439C101.751 141.464 83.0487 134.092 72.6702 118.924C62.2917 103.756 62.3631 83.597 72.8466 68.4975C83.3301 53.398 102.052 46.1492 119.927 50.3006L116.155 66.5293Z" />
    </svg>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [mobileTeamOpen, setMobileTeamOpen] = useState(false);
  const { settings } = useSiteSettings();
  const [footer] = useContent(CONTENT_KEYS.FOOTER, FOOTER_CONTENT_DEFAULTS);
  const [user, setUser] = useState<any>(null);
  useScrollReveal();

  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isTeamActive = pathname.startsWith("/team");

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
            {NAV_START.map((item) => (
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

            {/* Team Dropdown Menu */}
            <div
              className="relative"
              onMouseEnter={() => setTeamDropdownOpen(true)}
              onMouseLeave={() => setTeamDropdownOpen(false)}
            >
              <Link
                to="/team"
                className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  isTeamActive
                    ? "text-primary font-semibold"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                <span>টিম</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    teamDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </Link>

              {teamDropdownOpen && (
                <div className="absolute top-full left-0 w-64 pt-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">
                      টিম ডিপার্টমেন্ট
                    </div>
                    {TEAM_SUB_ITEMS.map((sub) => (
                      <Link
                        key={sub.label}
                        to="/team"
                        search={{ dept: sub.dept }}
                        onClick={() => setTeamDropdownOpen(false)}
                        className="flex flex-col px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent text-foreground transition-colors group"
                      >
                        <span className="group-hover:text-primary font-semibold">{sub.label}</span>
                        <span className="text-[11px] text-muted-foreground font-normal">{sub.desc}</span>
                      </Link>
                    ))}
                    <div className="pt-1.5 border-t border-border/60">
                      <Link
                        to="/team"
                        onClick={() => setTeamDropdownOpen(false)}
                        className="block text-center px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        সকল টিম মেম্বার দেখুন →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {NAV_END.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
                activeProps={{ className: "px-3 py-2 text-sm font-medium text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageTranslator />
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

          <div className="flex md:hidden items-center gap-2">
            <LanguageTranslator />
            <button
              className="p-2 -mr-2"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3 space-y-1">
              {NAV_START.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Team Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileTeamOpen(!mobileTeamOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-accent ${
                    isTeamActive ? "text-primary font-bold" : "text-foreground"
                  }`}
                >
                  <span>টিম</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      mobileTeamOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileTeamOpen && (
                  <div className="pl-4 pr-2 py-1 space-y-1 bg-muted/30 rounded-lg mt-1 border-l-2 border-primary/40 ml-2">
                    <Link
                      to="/team"
                      onClick={() => setOpen(false)}
                      className="block px-3 py-1.5 rounded-md text-xs font-bold text-primary hover:bg-accent"
                    >
                      সকল টিম মেম্বার (All Members)
                    </Link>
                    {TEAM_SUB_ITEMS.map((sub) => (
                      <Link
                        key={sub.label}
                        to="/team"
                        search={{ dept: sub.dept }}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-1.5 rounded-md text-xs font-medium text-foreground/80 hover:text-primary hover:bg-accent"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {NAV_END.map((item) => (
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
                <div className="h-11 w-11 rounded-lg bg-white grid place-items-center shadow-md p-1.5">
                  <img src={brandLogo.url} alt={settings.brandName} className="h-full w-full object-contain" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight">{settings.brandName}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/75">{settings.brandTagline}</p>
              <div className="mt-5 flex items-center gap-3">
                {[
                  { Icon: Facebook, label: "Facebook", href: settings.facebookUrl },
                  { Icon: Youtube, label: "YouTube", href: settings.youtubeUrl },
                  { Icon: Instagram, label: "Instagram", href: settings.instagramUrl },
                  { Icon: ThreadsIcon, label: "Threads", href: settings.threadsUrl || settings.linkedinUrl },
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
              <h4 className="text-lg font-bold mb-4">{footer.companyHeading}</h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li><Link to="/about" className="hover:text-white transition-colors">আমাদের সম্পর্কে</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white transition-colors">রিফান্ড পলিসি</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">প্রাইভেসি পলিসি</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">শর্তাবলী</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4">{footer.contactHeading}</h4>
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
              <h4 className="text-lg font-bold mb-4">{footer.quickLinksHeading}</h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li>
                  {(() => {
                    const target = settings.affiliateUrl || "/affiliate";
                    const isExternal = target.startsWith("http://") || target.startsWith("https://");
                    if (isExternal) {
                      return (
                        <a
                          href={target}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          অ্যাফিলিয়েট অ্যাকাউন্ট
                        </a>
                      );
                    }
                    return (
                      <Link to={target} className="hover:text-white transition-colors">
                        অ্যাফিলিয়েট অ্যাকাউন্ট
                      </Link>
                    );
                  })()}
                </li>
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
            <p>{footer.copyright.replace("{year}", String(new Date().getFullYear())).replace("{brand}", settings.brandName)}</p>
            <p>{footer.madeInText}</p>
          </div>
        </div>
      </footer>


    </div>
  );
}
