import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { api, setToken, setStoredUser } from "@/lib/api";
import { useContent } from "@/lib/content-store";
import { AUTH_CONTENT_DEFAULTS, CONTENT_KEYS } from "@/lib/content-defaults";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "লগইন — Vencon Academy" },
      { name: "description", content: "Vencon Academy অ্যাকাউন্টে লগইন করুন।" },
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot Password Modal / View State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1 = Enter Email, 2 = Enter Code & New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotErr, setForgotErr] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSuccessMsg(null);
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
      setErr(e.message || "লগইন করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErr(null);
    setForgotSuccess(null);
    setForgotLoading(true);
    try {
      const res = await api<{ message: string }>("auth/forgot-password.php", {
        method: "POST",
        body: { email: forgotEmail },
      });
      setForgotSuccess(res.message || "ভেরিফিকেশন কোড ইমেইলে পাঠানো হয়েছে।");
      setForgotStep(2);
    } catch (e: any) {
      setForgotErr(e.message || "ভেরিফিকেশন কোড পাঠাতে ব্যর্থ হয়েছে।");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErr(null);
    setForgotLoading(true);
    try {
      const res = await api<{ message: string }>("auth/reset-password.php", {
        method: "POST",
        body: {
          email: forgotEmail,
          code: otpCode,
          new_password: newPassword,
        },
      });
      setSuccessMsg(res.message || "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।");
      setEmail(forgotEmail);
      setPassword(newPassword);
      setShowForgotModal(false);
      // Reset forgot form states
      setForgotStep(1);
      setOtpCode("");
      setNewPassword("");
      setForgotErr(null);
    } catch (e: any) {
      setForgotErr(e.message || "পাসওয়ার্ড রিসেট করা সম্ভব হয়নি।");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm relative overflow-hidden">
          <h1 className="text-2xl font-bold">{c.loginTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{c.loginSubtitle}</p>

          {successMsg && (
            <div className="mt-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-sm p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{successMsg}</div>
            </div>
          )}

          {err && <div className="mt-4 rounded-lg bg-destructive/10 text-destructive text-sm p-3">{err}</div>}

          <form onSubmit={submitLogin} className="mt-6 space-y-4">
            <Field label={c.loginEmailLabel} type="email" value={email} onChange={setEmail} required />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">{c.loginPasswordLabel}</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotStep(1);
                    setForgotErr(null);
                    setForgotSuccess(null);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:bg-primary/90 disabled:opacity-60 cursor-pointer transition-colors"
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold">পাসওয়ার্ড রিসেট</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-muted-foreground hover:text-foreground text-xl font-semibold leading-none p-1 rounded-md hover:bg-muted"
              >
                ✕
              </button>
            </div>

            {forgotErr && (
              <div className="mb-4 rounded-lg bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">
                {forgotErr}
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 border border-green-500/20 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  আপনার অ্যাকাউন্টের ইমেইল ঠিকানাটি প্রদান করুন। আমরা আপনাকে একটি ৬-সংখ্যার ভেরিফিকেশন কোড ইমেইল করবো।
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1.5">ইমেইল ঠিকানা</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:bg-primary/90 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {forgotLoading ? "কোড পাঠানো হচ্ছে..." : "ভেরিফিকেশন কোড পাঠান"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  আপনার <strong>{forgotEmail}</strong> ইমেইলে পাঠানো ৬-সংখ্যার কোড এবং আপনার নতুন পাসওয়ার্ড দিন।
                </p>

                <div>
                  <label className="block text-sm font-medium mb-1.5">৬-সংখ্যার ভেরিফিকেশন কোড (OTP)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.trim())}
                    placeholder="123456"
                    required
                    className="w-full text-center tracking-widest text-lg font-mono rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">নতুন পাসওয়ার্ড (New Password)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="নূন্যতম ৬ অক্ষর"
                    minLength={6}
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    পেছনে
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
                  >
                    {forgotLoading ? "পাসওয়ার্ড আপডেট হচ্ছে..." : "পাসওয়ার্ড রিসেট করুন"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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
