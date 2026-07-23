import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Facebook, Copy, Check, ExternalLink, Save, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { PageHeader, Card, Field, Input, Textarea, Button, useToast } from "@/components/admin/ui";
import { useMarketing, DEFAULT_MARKETING } from "@/lib/marketing";

export const Route = createFileRoute("/admin/marketing")({
  component: MarketingPage,
});

function MarketingPage() {
  const { settings, update, reset, track } = useMarketing();
  const toast = useToast();
  const [copied, setCopied] = useState<string>("");

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch { /* noop */ }
  };

  const testEvent = () => {
    if (!settings.fb_pixel_id) {
      toast.show("আগে Pixel ID সেট করুন");
      return;
    }
    track("Lead", { source: "admin_test", value: 1, currency: "BDT" });
    toast.show("Test Lead ইভেন্ট পাঠানো হয়েছে — Events Manager এ চেক করুন");
  };

  const metaTag = settings.fb_domain_verification
    ? `<meta name="facebook-domain-verification" content="${settings.fb_domain_verification}" />`
    : "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="মার্কেটিং ও Facebook Pixel"
        subtitle="Ads এর জন্য ট্র্যাকিং, Pixel, Conversions API এবং Domain Verification"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { reset(); toast.show("রিসেট হয়েছে"); }}>
              <RotateCcw className="h-4 w-4" /> রিসেট
            </Button>
          </div>
        }
      />

      {/* Status banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${settings.fb_pixel_id ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
        {settings.fb_pixel_id ? <ShieldCheck className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
        <div className="flex-1 text-sm">
          {settings.fb_pixel_id
            ? <>Facebook Pixel <b>{settings.fb_pixel_id}</b> সক্রিয় — সব পেইজে PageView, ViewContent, InitiateCheckout, Purchase, CompleteRegistration ইভেন্ট ফায়ার হচ্ছে।</>
            : <>Pixel ID সেট করা হয়নি। Meta Ads চালানোর জন্য নিচে Pixel ID যোগ করুন।</>}
        </div>
        {settings.fb_pixel_id && (
          <Button variant="secondary" onClick={testEvent}>
            <Zap className="h-4 w-4" /> Test Event
          </Button>
        )}
      </div>

      {/* Facebook Pixel */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Facebook className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-lg">Facebook Pixel (Meta Ads)</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Pixel ID *" hint="Events Manager → Data Sources থেকে সংগ্রহ করুন">
            <Input
              value={settings.fb_pixel_id}
              onChange={(e) => update({ fb_pixel_id: e.target.value.trim() })}
              placeholder="1234567890123456"
            />
          </Field>

          <Field label="CAPI Access Token" hint="Events Manager → Settings → Conversions API (Server-side)">
            <Input
              type="password"
              value={settings.fb_capi_token}
              onChange={(e) => update({ fb_capi_token: e.target.value.trim() })}
              placeholder="EAAG..."
            />
          </Field>

          <Field label="Test Event Code" hint="Events Manager → Test Events tab থেকে কপি করুন (TEST12345)">
            <Input
              value={settings.fb_test_event_code}
              onChange={(e) => update({ fb_test_event_code: e.target.value.trim() })}
              placeholder="TEST12345"
            />
          </Field>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.fb_auto_pageview}
                onChange={(e) => update({ fb_auto_pageview: e.target.checked })}
                className="h-4 w-4"
              />
              প্রতি পেইজে অটো PageView পাঠাও
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.fb_advanced_matching}
                onChange={(e) => update({ fb_advanced_matching: e.target.checked })}
                className="h-4 w-4"
              />
              Advanced Matching চালু করো (ম্যাচ কোয়ালিটি বাড়াবে)
            </label>
          </div>
        </div>

        <div className="mt-5 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">✅ অটো-ট্র্যাক হচ্ছে:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><b>PageView</b> — প্রতি পেইজ লোডে</li>
            <li><b>ViewContent</b> — কোর্স ডিটেইল পেইজে (content_ids, value, currency)</li>
            <li><b>InitiateCheckout</b> — এনরোল বাটনে ক্লিকে</li>
            <li><b>Purchase</b> — অর্ডার সাবমিটে (value, currency: BDT)</li>
            <li><b>CompleteRegistration</b> — নতুন ইউজার সাইনআপে</li>
            <li><b>Lead</b> — কন্ট্যাক্ট ফর্ম / WhatsApp ক্লিকে</li>
          </ul>
        </div>
      </Card>

      {/* Domain Verification */}
      <Card>
        <h3 className="font-bold text-lg mb-1">Facebook Domain Verification</h3>
        <p className="text-sm text-muted-foreground mb-4">
          iOS 14+ এবং Aggregated Event Measurement এর জন্য এটা লাগবেই। Business Suite → Brand Safety → Domains থেকে verification code পাবেন।
        </p>

        <Field label="Verification Code" hint="Meta Business Suite থেকে মেটা ট্যাগ পদ্ধতি সিলেক্ট করে content= এর ভিতরের কোডটা এখানে দিন">
          <Input
            value={settings.fb_domain_verification}
            onChange={(e) => update({ fb_domain_verification: e.target.value.trim() })}
            placeholder="abcd1234efgh5678..."
          />
        </Field>

        {metaTag && (
          <div className="mt-4">
            <div className="text-xs font-medium mb-1">সাইটে যে ট্যাগটি ইনজেক্ট হচ্ছে:</div>
            <div className="flex gap-2 items-center bg-muted rounded-lg p-3">
              <code className="text-xs flex-1 break-all">{metaTag}</code>
              <button
                onClick={() => copy(metaTag, "meta")}
                className="p-2 rounded hover:bg-background"
                aria-label="Copy"
              >
                {copied === "meta" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              সেভ করার পর Business Suite এ ফিরে গিয়ে <b>Verify Domain</b> ক্লিক করুন।
            </p>
          </div>
        )}

        <a
          href="https://business.facebook.com/settings/owned-domains"
          target="_blank" rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Business Suite এ খুলুন <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Card>

      {/* Google (bonus) */}
      <Card>
        <h3 className="font-bold text-lg mb-1">Google Analytics / Tag Manager</h3>
        <p className="text-sm text-muted-foreground mb-4">ঐচ্ছিক — একই জায়গা থেকে Google ট্যাগও ম্যানেজ করুন।</p>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="GA4 Measurement ID">
            <Input
              value={settings.ga_measurement_id}
              onChange={(e) => update({ ga_measurement_id: e.target.value.trim() })}
              placeholder="G-XXXXXXXXXX"
            />
          </Field>
          <Field label="GTM Container ID">
            <Input
              value={settings.gtm_container_id}
              onChange={(e) => update({ gtm_container_id: e.target.value.trim() })}
              placeholder="GTM-XXXXXXX"
            />
          </Field>
        </div>
      </Card>

      {/* Ads best practices */}
      <Card>
        <h3 className="font-bold text-lg mb-3">✨ Ads এ ভালো রেজাল্ট এর জন্য টিপস</h3>
        <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
          <li>প্রতিটা কোর্সে ভালো <b>OG Image (1200×630)</b> ব্যবহার করুন — শেয়ার হলে ভালো দেখাবে।</li>
          <li>Pixel সেট করার পর অন্তত <b>৪৮ ঘন্টা</b> ট্রাফিক আসতে দিন Custom Audience বানানোর আগে।</li>
          <li><b>Advantage+ Placements</b> ব্যবহার করুন — Meta AI নিজেই optimize করবে।</li>
          <li>প্রথমে <b>Purchase objective</b> এ না গিয়ে <b>Traffic / Engagement</b> দিয়ে data সংগ্রহ করুন।</li>
          <li>Domain verify করার পর <b>Aggregated Event Measurement</b> এ Purchase কে সবচেয়ে উপরে (Priority 1) রাখুন।</li>
        </ul>
      </Card>

      {toast.node}
    </div>
  );
}
