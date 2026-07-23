import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { api, setToken, setStoredUser } from "@/lib/api";
import { useContent } from "@/lib/content-store";
import { AUTH_CONTENT_DEFAULTS, CONTENT_KEYS } from "@/lib/content-defaults";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "লগইন — NextScale" },
      { name: "description", content: "NextScale অ্যাকাউন্টে লগইন করুন।" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [c] = useContent(CONTENT_KEYS.AUTH, AUTH_CONTENT_DEFAULTS);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api<{ user: any; token: string }>("auth/login.php", {
        method: "POST",
        body: { email, password },
      });
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
          <h1 className="text-2xl font-bold">{c.loginTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{c.loginSubtitle}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label={c.loginEmailLabel} type="email" value={email} onChange={setEmail} required />
            <Field label={c.loginPasswordLabel} type="password" value={password} onChange={setPassword} required />
            {err && <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{err}</div>}
            <button
              disabled={loading}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? c.loginSubmittingLabel : c.loginSubmitLabel}
            </button>
          </form>
          {c.loginExtraHtml?.trim() && (
            <div
              className="mt-6 text-sm text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: c.loginExtraHtml }}
            />
          )}
          <p className="mt-6 text-sm text-center text-muted-foreground">
            {c.loginFooterText}{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              {c.loginFooterLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

export function Field({ label, type = "text", value, onChange, required }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
