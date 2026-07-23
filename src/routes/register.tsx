import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { api, setToken, setStoredUser } from "@/lib/api";
import { Field } from "./login";
import { useContent } from "@/lib/content-store";
import { AUTH_CONTENT_DEFAULTS, CONTENT_KEYS } from "@/lib/content-defaults";

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
  const [c] = useContent(CONTENT_KEYS.AUTH, AUTH_CONTENT_DEFAULTS);
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
          <h1 className="text-2xl font-bold">{c.registerTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{c.registerSubtitle}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label={c.registerNameLabel} value={f.name} onChange={set("name")} required />
            <Field label={c.registerEmailLabel} type="email" value={f.email} onChange={set("email")} required />
            <Field label={c.registerPhoneLabel} value={f.phone} onChange={set("phone")} />
            <Field label={c.registerPasswordLabel} type="password" value={f.password} onChange={set("password")} required />
            {err && <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{err}</div>}
            <button disabled={loading} className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:bg-primary/90 disabled:opacity-60">
              {loading ? c.registerSubmittingLabel : c.registerSubmitLabel}
            </button>
          </form>
          {c.registerExtraHtml?.trim() && (
            <div
              className="mt-6 text-sm text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: c.registerExtraHtml }}
            />
          )}
          <p className="mt-6 text-sm text-center text-muted-foreground">
            {c.registerFooterText}{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              {c.registerFooterLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
