import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings, BookOpen, Users, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const cards = [
    { to: "/admin/settings", label: "সাইট সেটিংস", desc: "ব্র্যান্ড, WhatsApp, কালার নিয়ন্ত্রণ করুন", Icon: Settings },
    { to: "/admin/courses", label: "কোর্স ম্যানেজমেন্ট", desc: "কোর্স যোগ, এডিট, ডিলিট করুন", Icon: BookOpen },
    { to: "/admin/trainers", label: "ট্রেনার ম্যানেজমেন্ট", desc: "ট্রেনার প্রোফাইল কনফিগার", Icon: Users },
    { to: "/admin/orders", label: "অর্ডার লিস্ট", desc: "সব অর্ডার ও পেমেন্ট", Icon: ShoppingCart },
  ] as const;
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">অ্যাডমিন ড্যাশবোর্ড</h1>
      <p className="mt-1 text-muted-foreground text-sm">এখান থেকে সাইটের সব কিছু নিয়ন্ত্রণ করুন।</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <c.Icon className="h-5 w-5" />
            </div>
            <div className="mt-3 font-semibold">{c.label}</div>
            <div className="text-sm text-muted-foreground">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
