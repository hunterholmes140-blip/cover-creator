import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Layers, Zap, Globe } from "lucide-react";
import { Link } from "@tanstack/react-router";
import coverHero from "@/assets/cover-hero.jpg";

export const Route = createFileRoute("/cover")({
  head: () => ({
    meta: [
      { title: "NextScale | IT Cover" },
      { name: "description", content: "Enterprise IT infrastructure, scaled with precision." },
      { property: "og:title", content: "NextScale | IT Cover" },
      { property: "og:description", content: "Enterprise IT infrastructure, scaled with precision." },
      { property: "og:image", content: coverHero },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: coverHero },
    ],
  }),
  component: CoverPage,
});

const metrics = [
  { label: "Global uptime", value: "99.999%" },
  { label: "Markets served", value: "40+" },
  { label: "Workloads managed", value: "2M+" },
];

const pillars = [
  {
    icon: Layers,
    title: "Modular architecture",
    description: "Composable stacks that grow with your business.",
  },
  {
    icon: Zap,
    title: "High-performance edge",
    description: "Low-latency delivery across distributed networks.",
  },
  {
    icon: Globe,
    title: "Worldwide resilience",
    description: "Multi-region failover designed for continuity.",
  },
];

function CoverPage() {
  return (
    <div className="dark min-h-screen bg-ink text-foreground">
      <main className="relative min-h-screen overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={coverHero}
            alt="Abstract data network visualization"
            width={1920}
            height={1088}
            className="h-full w-full object-cover opacity-80"
            style={{ maskImage: "linear-gradient(to right, transparent 0%, black 45%)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 lg:px-20">
          <div className="font-display text-2xl font-bold tracking-tight text-white">
            next<span className="text-cyan">scale</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
            <span className="hover:text-white">Solutions</span>
            <span className="hover:text-white">Platform</span>
            <span className="hover:text-white">Insights</span>
            <span className="hover:text-white">Contact</span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:border-cyan hover:bg-cyan/10 hover:text-cyan"
          >
            Enter site
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        {/* Hero content */}
        <section className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col justify-center px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
              Enterprise IT · 2026
            </p>
            <h1 className="font-display text-6xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl">
              Scale the
              <br />
              invisible.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
              Infrastructure that moves as fast as your ambition. We design, deploy, and operate
              the systems that power tomorrow's enterprises.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 rounded-full bg-cyan px-7 py-3.5 text-sm font-semibold text-cyan-foreground transition-transform hover:scale-105">
                Start the conversation
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5">
                View capabilities
              </button>
            </div>

            {/* Metrics */}
            <div className="mt-16 grid max-w-2xl grid-cols-1 gap-8 border-t border-white/10 pt-8 sm:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="font-display text-3xl font-bold text-white md:text-4xl">
                    {m.value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/50">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars strip */}
        <section className="relative z-10 border-t border-white/10 bg-ink/80 px-6 py-12 backdrop-blur md:px-12 lg:px-20">
          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group rounded-xl border border-white/10 p-6 transition-colors hover:border-cyan/30 hover:bg-white/5"
              >
                <p.icon className="mb-4 h-6 w-6 text-cyan" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 flex items-center justify-between border-t border-white/10 px-6 py-6 text-xs text-white/40 md:px-12 lg:px-20">
          <span>© 2026 NextScale. All rights reserved.</span>
          <span className="hidden md:inline">Editorial cover · Issue 01</span>
        </footer>
      </main>
    </div>
  );
}
