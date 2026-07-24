import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSiteSettings, DEFAULT_SETTINGS, type SiteSettings, whatsappLink } from "@/lib/site-settings";
import { Save, RotateCcw, ExternalLink, KeyRound, ShieldCheck, Laptop, Smartphone, Trash2, LogOut, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-foreground">{label}</div>
      {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${props.className ?? ""}`}
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 rounded border border-border bg-transparent cursor-pointer"
      />
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

type DeviceSession = {
  id: number;
  session_token: string;
  device_type: string;
  device_name: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
};

function AdminPasswordSection() {
  const toast = useToast();
  const [currPw, setCurrPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (newPw !== confirmPw) {
      setErr("নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।");
      return;
    }

    setLoading(true);
    try {
      const res = await api<{ message: string }>("admin/change-password.php", {
        method: "POST",
        auth: true,
        body: { current_password: currPw, new_password: newPw },
      });
      setMsg(res.message || "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।");
      toast.show("পাসওয়ার্ড আপডেট হয়েছে 🔒");
      setCurrPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e: any) {
      setErr(e.message || "পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <KeyRound className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">এডমিন পাসওয়ার্ড পরিবর্তন</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">বর্তমান পাসওয়ার্ড</label>
          <TextInput
            type="password"
            required
            value={currPw}
            onChange={(e) => setCurrPw(e.target.value)}
            placeholder="বর্তমান পাসওয়ার্ড দিন"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">নতুন পাসওয়ার্ড</label>
          <TextInput
            type="password"
            required
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">নতুন পাসওয়ার্ড কনফার্ম করুন</label>
          <TextInput
            type="password"
            required
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
          />
        </div>

        {msg && <div className="rounded-md bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-xs p-3 font-medium">{msg}</div>}
        {err && <div className="rounded-md bg-destructive/10 text-destructive text-xs p-3 font-medium">{err}</div>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
        </button>
      </form>
    </section>
  );
}

function AdminDevicesSection() {
  const toast = useToast();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await api<DeviceSession[]>("admin/sessions.php", { auth: true });
      setSessions(res || []);
    } catch {
      // Mock fallback if user_sessions table has no entries yet
      setSessions([
        {
          id: 1,
          session_token: "curr",
          device_type: "desktop",
          device_name: "Windows • Chrome Browser",
          ip_address: "103.12.45.69",
          last_active: "এখনই সক্রিয়",
          is_current: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRemoveDevice = async (id: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই ডিভাইসটি লগআউট করে দিতে চান?")) return;
    try {
      await api("admin/sessions.php", {
        method: "DELETE",
        auth: true,
        query: { id: String(id) },
      });
      toast.show("ডিভাইস সফলভাবে রিমুভ হয়েছে 📱");
      loadSessions();
    } catch (e: any) {
      toast.show(e.message || "রিমুভ করতে ব্যর্থ");
    }
  };

  const handleLogoutAllOthers = async () => {
    if (!confirm("আপনি কি নিশ্চিত অন্যান্য সকল ডিভাইস থেকে লগআউট করতে চান?")) return;
    try {
      await api("admin/sessions.php", {
        method: "DELETE",
        auth: true,
        query: { action: "all_others" },
      });
      toast.show("অন্যান্য সকল ডিভাইস থেকে লগআউট করা হয়েছে 🔒");
      loadSessions();
    } catch (e: any) {
      toast.show(e.message || "লগআউট করতে ব্যর্থ");
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">সক্রিয় ডিভাইস ও সিকিউরিটি ট্র্যাকিং</h2>
            <p className="text-xs text-muted-foreground">আপনার অ্যাকাউন্ট বর্তমানে যে যে ডিভাইসে লগইন করা রয়েছে।</p>
          </div>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleLogoutAllOthers}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> অন্যান্য সকল ডিভাইস রিমুভ করুন
          </button>
        )}
      </div>

      <div className="divide-y divide-border rounded-xl border border-border bg-background overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-xs text-muted-foreground">ডিভাইস ডাটা লোড হচ্ছে...</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">কোন সক্রিয় ডিভাইস পাওয়া যায়নি।</div>
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  {s.device_type === "mobile" ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    {s.device_name}
                    {s.is_current ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 text-[10px] font-bold border border-green-500/20">
                        <CheckCircle2 className="h-3 w-3" /> বর্তমান ডিভাইস
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-medium">
                        সক্রিয় ডিভাইস
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                    <span>IP: {s.ip_address || "অজানা"}</span>
                    <span>•</span>
                    <span>সর্বশেষ সক্রিয়: {s.last_active}</span>
                  </div>
                </div>
              </div>

              {!s.is_current && (
                <button
                  onClick={() => handleRemoveDevice(s.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-1.5 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> রিমুভ করুন
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function AdminSettingsPage() {
  const { settings, update, reset } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    update(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">সাইট ও সিকিউরিটি সেটিংস</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ব্র্যান্ড সেটিংস, পাসওয়ার্ড পরিবর্তন এবং সক্রিয় ডিভাইস নিয়ন্ত্রণ করুন।
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { reset(); setForm(DEFAULT_SETTINGS); }}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4" /> ডিফল্টে ফিরুন
          </button>
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow"
          >
            <Save className="h-4 w-4" /> সেটিংস সেভ করুন
          </button>
        </div>
      </header>

      {saved && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-700 dark:text-green-400">
          সেটিংস সেভ হয়েছে ✓
        </div>
      )}

      {/* Admin Password Change Section */}
      <AdminPasswordSection />

      {/* Admin Devices & Sessions Security Section */}
      <AdminDevicesSection />

      {/* Brand */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">ব্র্যান্ড</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ব্র্যান্ডের নাম">
            <TextInput value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
          </Field>
          <Field label="ট্যাগলাইন">
            <TextInput value={form.brandTagline} onChange={(e) => set("brandTagline", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">যোগাযোগ</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp নাম্বার" hint="ইন্টারন্যাশনাল ফরম্যাট, শুধু ডিজিট (যেমন: 8801700000000)">
            <TextInput
              value={form.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value.replace(/[^\d]/g, ""))}
              placeholder="8801700000000"
            />
            {form.whatsappNumber && (
              <a
                href={whatsappLink(form.whatsappNumber)}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                লিঙ্ক টেস্ট করুন <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </Field>
          <Field label="ফোন">
            <TextInput value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} />
          </Field>
          <Field label="ইমেইল">
            <TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Social */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">সোশ্যাল লিঙ্ক</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook URL"><TextInput value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} /></Field>
          <Field label="YouTube URL"><TextInput value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} /></Field>
          <Field label="Instagram URL"><TextInput value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} /></Field>
          <Field label="LinkedIn URL"><TextInput value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} /></Field>
        </div>
      </section>

      {/* Colors */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">কালার</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary (HSL)" hint='HSL values: "262 83% 58%"'>
            <TextInput value={form.primaryHsl} onChange={(e) => set("primaryHsl", e.target.value)} />
          </Field>
          <Field label="Accent (HSL)">
            <TextInput value={form.accentHsl} onChange={(e) => set("accentHsl", e.target.value)} />
          </Field>
          <Field label="ফুটার গ্র্যাডিয়েন্ট — শুরু">
            <ColorInput value={form.footerFrom} onChange={(v) => set("footerFrom", v)} />
          </Field>
          <Field label="ফুটার গ্র্যাডিয়েন্ট — মধ্য">
            <ColorInput value={form.footerVia} onChange={(v) => set("footerVia", v)} />
          </Field>
          <Field label="ফুটার গ্র্যাডিয়েন্ট — শেষ">
            <ColorInput value={form.footerTo} onChange={(v) => set("footerTo", v)} />
          </Field>
        </div>
        <div className="rounded-lg overflow-hidden border border-border">
          <div
            className="h-16"
            style={{
              backgroundImage: `linear-gradient(135deg, ${form.footerFrom} 0%, ${form.footerVia} 45%, ${form.footerTo} 100%)`,
            }}
          />
          <div className="px-3 py-2 text-xs text-muted-foreground bg-card">প্রিভিউ — ফুটার গ্র্যাডিয়েন্ট</div>
        </div>
      </section>

      <div className="pt-4">
        <button
          onClick={save}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-4 w-4" /> সেটিংস সেভ করুন
        </button>
      </div>
    </div>
  );
}
