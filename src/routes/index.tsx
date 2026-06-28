import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Layers, Zap, Globe } from "lucide-react";
import coverHero from "@/assets/cover-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "নেক্সটস্কেল | আইটি কভার" },
      { name: "description", content: "এন্টারপ্রাইজ আইটি অবকাঠামো — নিখুঁতভাবে স্কেল করা।" },
      { property: "og:title", content: "নেক্সটস্কেল | আইটি কভার" },
      { property: "og:description", content: "এন্টারপ্রাইজ আইটি অবকাঠামো — নিখুঁতভাবে স্কেল করা।" },
      { property: "og:image", content: coverHero },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: coverHero },
    ],
  }),
  component: CoverPage,
});

const metrics = [
  { label: "গ্লোবাল আপটাইম", value: "৯৯.৯৯৯%" },
  { label: "সেবিত বাজার", value: "৪০+" },
  { label: "পরিচালিত ওয়ার্কলোড", value: "২০ লক্ষ+" },
];

const pillars = [
  { icon: Layers, title: "মডুলার আর্কিটেকচার", description: "আপনার ব্যবসার সাথে বেড়ে ওঠা কম্পোজেবল স্ট্যাক।" },
  { icon: Zap, title: "হাই-পারফরম্যান্স এজ", description: "বিতরণকৃত নেটওয়ার্ক জুড়ে কম-লেটেন্সি ডেলিভারি।" },
  { icon: Globe, title: "বিশ্বব্যাপী রেজিলিয়েন্স", description: "ধারাবাহিকতার জন্য নকশাকৃত মাল্টি-রিজিয়ন ফেইলওভার।" },
];

function CoverPage() {
  return (
    <div className="dark min-h-screen bg-ink text-foreground">
      <main className="relative min-h-screen overflow-hidden">
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

        <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 lg:px-20">
          <div className="font-display text-2xl font-bold tracking-tight text-white">
            নেক্সট<span className="text-cyan">স্কেল</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
            <span className="hover:text-white">সমাধান</span>
            <span className="hover:text-white">প্ল্যাটফর্ম</span>
            <span className="hover:text-white">ইনসাইট</span>
            <span className="hover:text-white">যোগাযোগ</span>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:border-cyan hover:bg-cyan/10 hover:text-cyan">
            যোগাযোগ করুন
            <ArrowRight className="h-4 w-4" />
          </button>
        </nav>

        <section className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col justify-center px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
              এন্টারপ্রাইজ আইটি · ২০২৬
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.15] tracking-tight text-white md:text-6xl lg:text-7xl">
              অদৃশ্যকে
              <br />
              স্কেল করুন।
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
              এমন অবকাঠামো যা আপনার উচ্চাকাঙ্ক্ষার মতো দ্রুত চলে। আগামী দিনের এন্টারপ্রাইজকে
              শক্তি জোগানো সিস্টেম আমরা ডিজাইন, ডিপ্লয় ও পরিচালনা করি।
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 rounded-full bg-cyan px-7 py-3.5 text-sm font-semibold text-cyan-foreground transition-transform hover:scale-105">
                আলোচনা শুরু করুন
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5">
                সক্ষমতা দেখুন
              </button>
            </div>

            <div className="mt-16 grid max-w-2xl grid-cols-1 gap-8 border-t border-white/10 pt-8 sm:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="font-display text-3xl font-bold text-white md:text-4xl">{m.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-white/50">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 border-t border-white/10 bg-ink/80 px-6 py-12 backdrop-blur md:px-12 lg:px-20">
          <div className="grid gap-8 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="group rounded-xl border border-white/10 p-6 transition-colors hover:border-cyan/30 hover:bg-white/5">
                <p.icon className="mb-4 h-6 w-6 text-cyan" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="relative z-10 flex items-center justify-between border-t border-white/10 px-6 py-6 text-xs text-white/40 md:px-12 lg:px-20">
          <span>© ২০২৬ নেক্সটস্কেল। সর্বস্বত্ব সংরক্ষিত।</span>
          <span className="hidden md:inline">এডিটোরিয়াল কভার · সংখ্যা ০১</span>
        </footer>
      </main>
    </div>
  );
}
