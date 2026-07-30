import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, Save, CheckCircle2, AlertCircle, RefreshCw, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/email-settings")({
  component: AdminEmailSettingsPage,
});

type TemplateConfig = {
  subject: string;
  title: string;
  body: string;
  button_text: string;
};

function AdminEmailSettingsPage() {
  const [activeTab, setActiveTab] = useState<"payment_success" | "payment_failed" | "order_pending" | "smtp">("payment_success");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Record<string, TemplateConfig>>({
    payment_success: { subject: "", title: "", body: "", button_text: "" },
    payment_failed: { subject: "", title: "", body: "", button_text: "" },
    order_pending: { subject: "", title: "", body: "", button_text: "" },
  });

  const [smtp, setSmtp] = useState({
    host: "smtp.hostinger.com",
    port: 465,
    user: "support@vencon.com.bd",
    pass: "Foyej2022@",
    from_name: "Vencon Academy",
  });

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api<any>("admin/email-settings.php", { auth: true });
      if (data) {
        if (data.templates) setTemplates(data.templates);
        if (data.smtp) setSmtp(data.smtp);
      }
    } catch (e: any) {
      setErr(e?.message || "ইমেইল সেটিংস লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      await api("admin/email-settings.php", {
        method: "POST",
        auth: true,
        body: { templates, smtp },
      });
      setMsg("ইমেইল টেমপ্লেট ও সেটিংস সফলভাবে সেভ করা হয়েছে!");
    } catch (e: any) {
      setErr(e?.message || "সেভ করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
        <RefreshCw className="h-5 w-5 animate-spin" />
        <span>ইমেইল সেটিংস লোড হচ্ছে...</span>
      </div>
    );
  }

  const currentTpl = templates[activeTab] || { subject: "", title: "", body: "", button_text: "" };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" /> ইমেইল নোটিফিকেশন ও অটোমেটিক টেমপ্লেট
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            পেমেন্ট সফল, ব্যর্থ বা ম্যানুয়াল অর্ডার জমা হলে কাস্টমারকে কোন ইমেইলটি অটো সেন্ড হবে তা এখান থেকে কাস্টমাইজ করুন।
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold shadow-md hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
        </button>
      </div>

      {msg && (
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-600 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {err && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("payment_success")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
            activeTab === "payment_success"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          ✅ পেমেন্ট সফল মেইল
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payment_failed")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
            activeTab === "payment_failed"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          ❌ পেমেন্ট ফেইল্ড মেইল
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("order_pending")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
            activeTab === "order_pending"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          ⏳ ম্যানুয়াল পেন্ডিং মেইল
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("smtp")}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors ${
            activeTab === "smtp"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          ⚙️ Hostinger SMTP তথ্য
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {activeTab !== "smtp" ? (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Left: Editor */}
            <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-bold text-base text-foreground border-b border-border pb-2 flex items-center justify-between">
                <span>টেমপ্লেট কনটেন্ট সম্পাদনা</span>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                  Auto Trigger
                </span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  মেইল সাবজেক্ট (Email Subject) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={currentTpl.subject}
                  onChange={(e) =>
                    setTemplates({
                      ...templates,
                      [activeTab]: { ...currentTpl, subject: e.target.value },
                    })
                  }
                  placeholder="ইমেইলের বিষয়..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  মেইলের প্রধান হেডিং (Main Heading)
                </label>
                <input
                  type="text"
                  value={currentTpl.title}
                  onChange={(e) =>
                    setTemplates({
                      ...templates,
                      [activeTab]: { ...currentTpl, title: e.target.value },
                    })
                  }
                  placeholder="মেইলের হেডিং..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  মেইলের বডি টেক্সট (Body Content)
                </label>
                <textarea
                  rows={8}
                  value={currentTpl.body}
                  onChange={(e) =>
                    setTemplates({
                      ...templates,
                      [activeTab]: { ...currentTpl, body: e.target.value },
                    })
                  }
                  placeholder="মেইলের বিস্তারিত তথ্য..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  বাটনের নাম (Action Button Text)
                </label>
                <input
                  type="text"
                  value={currentTpl.button_text}
                  onChange={(e) =>
                    setTemplates({
                      ...templates,
                      [activeTab]: { ...currentTpl, button_text: e.target.value },
                    })
                  }
                  placeholder="যেমন: ড্যাশবোর্ডে যান"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Dynamic Variables Guide */}
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" /> ডাইনামিক ভ্যারিয়েবল কোড (কপি করুন):
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                  <code className="bg-background/80 px-2 py-0.5 rounded border border-amber-500/30">{"{{user_name}}"}</code>
                  <code className="bg-background/80 px-2 py-0.5 rounded border border-amber-500/30">{"{{user_email}}"}</code>
                  <code className="bg-background/80 px-2 py-0.5 rounded border border-amber-500/30">{"{{course_title}}"}</code>
                  <code className="bg-background/80 px-2 py-0.5 rounded border border-amber-500/30">{"{{amount}}"}</code>
                  <code className="bg-background/80 px-2 py-0.5 rounded border border-amber-500/30">{"{{transaction_id}}"}</code>
                </div>
              </div>
            </div>

            {/* Right: Live Preview Box */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                মেইল লাইব প্রিভিউ (Live Email Preview)
              </h4>
              <div className="rounded-2xl border border-border bg-slate-100 dark:bg-slate-900 p-4 shadow-inner min-h-[380px]">
                <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-4 text-center text-white font-bold text-lg">
                    Vencon Academy
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug">
                      {currentTpl.title || "মেইলের শিরোনাম"}
                    </h3>
                    <div
                      className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2"
                      dangerouslySetInnerHTML={{
                        __html: (currentTpl.body || "মেইলের লেখা...")
                          .replace(/\{\{\s*user_name\s*\}\}/g, "ফারাজুল ইসলাম")
                          .replace(/\{\{\s*course_title\s*\}\}/g, "ডিজিটাল মার্কেটিং মাস্টারক্লাস")
                          .replace(/\{\{\s*amount\s*\}\}/g, "৩,৯৯৯")
                          .replace(/\{\{\s*transaction_id\s*\}\}/g, "TXN178513778")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                    <div className="pt-4 text-center">
                      <span className="inline-block bg-orange-500 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md">
                        {currentTpl.button_text || "ড্যাশবোর্ডে যান"} →
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 text-center text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
                    © 2026 Vencon Academy • support@vencon.com.bd
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Hostinger SMTP Configuration Card */
          <div className="max-w-2xl mx-auto space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-bold text-base text-foreground border-b border-border pb-2 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Hostinger SMTP ক্রেডেনশিয়াল সেটিংস
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">SMTP Host</label>
                <input
                  type="text"
                  required
                  value={smtp.host}
                  onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                  placeholder="smtp.hostinger.com"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">SMTP Port</label>
                <input
                  type="number"
                  required
                  value={smtp.port}
                  onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                  placeholder="465"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Sender Email (Username)</label>
              <input
                type="email"
                required
                value={smtp.user}
                onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
                placeholder="support@vencon.com.bd"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Email Password</label>
              <input
                type="password"
                required
                value={smtp.pass}
                onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Sender Name (প্রেরকের নাম)</label>
              <input
                type="text"
                required
                value={smtp.from_name}
                onChange={(e) => setSmtp({ ...smtp, from_name: e.target.value })}
                placeholder="Vencon Academy"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
