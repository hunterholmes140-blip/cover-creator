import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { api, setToken, setStoredUser } from "@/lib/api";
import { track } from "@/lib/marketing";
import { Field } from "./login";
import { useContent } from "@/lib/content-store";
import { AUTH_CONTENT_DEFAULTS, CONTENT_KEYS, type RegisterField } from "@/lib/content-defaults";

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
  const [extra, setExtra] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setF({ ...f, [k]: v });
  const setEx = (k: string, v: any) => setExtra((e) => ({ ...e, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    // Validate custom required fields
    for (const cf of c.registerFields ?? []) {
      if (cf.required) {
        const val = extra[cf.id];
        if (val === undefined || val === null || val === "" || val === false) {
          setErr(`${cf.label} প্রয়োজন`);
          return;
        }
      }
    }
    setLoading(true);
    try {
      const res = await api<{ user: any; token: string }>("auth/register.php", {
        method: "POST",
        body: { ...f, extra },
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
          <h1 className="text-2xl font-bold">{c.registerTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{c.registerSubtitle}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {c.showName !== false && (
              <Field label={c.registerNameLabel} value={f.name} onChange={set("name")} required />
            )}
            <Field label={c.registerEmailLabel} type="email" value={f.email} onChange={set("email")} required />
            {c.showPhone !== false && (
              <Field label={c.registerPhoneLabel} value={f.phone} onChange={set("phone")} />
            )}
            <Field label={c.registerPasswordLabel} type="password" value={f.password} onChange={set("password")} required />

            {(c.registerFields ?? []).map((cf) => (
              <CustomField key={cf.id} field={cf} value={extra[cf.id]} onChange={(v) => setEx(cf.id, v)} />
            ))}

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

function CustomField({ field, value, onChange }: { field: RegisterField; value: any; onChange: (v: any) => void }) {
  const base = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
  const label = (
    <label className="block text-sm font-medium mb-1.5">
      {field.label}{field.required ? " *" : ""}
    </label>
  );

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          rows={3} value={value ?? ""} required={field.required}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      </div>
    );
  }

  if (field.type === "select") {
    const opts = (field.options ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    return (
      <div>
        {label}
        <select
          value={value ?? ""} required={field.required}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          <option value="">— নির্বাচন করুন —</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox" checked={!!value} required={field.required}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span>{field.label}{field.required ? " *" : ""}</span>
      </label>
    );
  }

  return (
    <div>
      {label}
      <input
        type={field.type}
        value={value ?? ""} required={field.required}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    </div>
  );
}
