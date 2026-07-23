import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { api, setToken, setStoredUser } from "@/lib/api";
import { Field } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "রেজিস্টার — NextScale" },
      { name: "description", content: "NextScale-এ নতুন অ্যাকাউন্ট তৈরি করুন।" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setF({ ...f, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api<{ user: any; token: string }>("auth/register.php", { method: "POST", body: f });
      setToken(res.token);
      setStoredUser(res.user);
      nav({ to: "/dashboard" });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold">নতুন অ্যাকাউন্ট</h1>
          <p className="mt-1 text-sm text-muted-foreground">ফ্রি রেজিস্টার করে শেখা শুরু করুন</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="পূর্ণ নাম" value={f.name} onChange={set("name")} required />
            <Field label="ইমেইল" type="email" value={f.email} onChange={set("email")} required />
            <Field label="ফোন (ঐচ্ছিক)" value={f.phone} onChange={set("phone")} />
            <Field label="পাসওয়ার্ড" type="password" value={f.password} onChange={set("password")} required />
            {err && <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{err}</div>}
            <button disabled={loading} className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:bg-primary/90 disabled:opacity-60">
              {loading ? "অপেক্ষা করুন..." : "রেজিস্টার করুন"}
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            ইতিমধ্যে অ্যাকাউন্ট আছে? <Link to="/login" className="text-primary font-medium hover:underline">লগইন</Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
