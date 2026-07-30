import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok, fail } from "@/lib/auth.server";
import crypto from "crypto";

function sha256(val: string): string {
  if (!val) return "";
  const cleaned = val.trim().toLowerCase();
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

export const Route = createFileRoute("/api/marketing/capi.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const body = await request.json().catch(() => ({}));
          const eventName = String(body.event_name || "").trim();
          if (!eventName) return fail(400, "event_name প্রয়োজন");

          // 1. Fetch Marketing Settings from site_content database
          const row = await qOne<any>(
            `SELECT content_json FROM site_content WHERE content_key = 'marketing_settings' LIMIT 1`
          ).catch(() => null);

          if (!row || !row.content_json) {
            return ok({ skipped: true, reason: "No marketing settings found" });
          }

          let settings: any = {};
          try {
            settings = JSON.parse(row.content_json);
          } catch {
            return ok({ skipped: true, reason: "Invalid marketing settings JSON" });
          }

          const pixelId = String(settings.fb_pixel_id || "").trim();
          const capiToken = String(settings.fb_capi_token || "").trim();
          const testEventCode = String(body.test_event_code || settings.fb_test_event_code || "").trim();

          if (!pixelId || !capiToken) {
            return ok({ skipped: true, reason: "Pixel ID or CAPI Token missing" });
          }

          // Extract User Data
          const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                           request.headers.get("cf-connecting-ip") ||
                           "127.0.0.1";
          const userAgent = request.headers.get("user-agent") || "";

          const rawUser = body.user_data || {};
          const emailHash = rawUser.em ? (rawUser.em.length === 64 ? rawUser.em : sha256(rawUser.em)) : "";
          const phoneHash = rawUser.ph ? (rawUser.ph.length === 64 ? rawUser.ph : sha256(rawUser.ph.replace(/[^\d]/g, ""))) : "";
          const fnHash = rawUser.fn ? (rawUser.fn.length === 64 ? rawUser.fn : sha256(rawUser.fn)) : "";
          const lnHash = rawUser.ln ? (rawUser.ln.length === 64 ? rawUser.ln : sha256(rawUser.ln)) : "";

          const eventId = String(body.event_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
          const eventSourceUrl = String(body.event_source_url || request.headers.get("referer") || "https://vencon.com.bd");

          const eventPayload: any = {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId,
            event_source_url: eventSourceUrl,
            action_source: "website",
            user_data: {
              client_ip_address: clientIp,
              client_user_agent: userAgent,
              ...(emailHash ? { em: [emailHash] } : {}),
              ...(phoneHash ? { ph: [phoneHash] } : {}),
              ...(fnHash ? { fn: [fnHash] } : {}),
              ...(lnHash ? { ln: [lnHash] } : {}),
            },
            ...(body.custom_data ? { custom_data: body.custom_data } : {}),
          };

          const postData: any = {
            data: [eventPayload],
          };

          if (testEventCode) {
            postData.test_event_code = testEventCode;
          }

          // 2. Dispatch to Facebook Meta Graph API Conversions API
          const fbEndpoint = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(capiToken)}`;

          const fbRes = await fetch(fbEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          });

          const fbJson = await fbRes.json().catch(() => ({}));

          return ok({
            success: fbRes.ok,
            status: fbRes.status,
            event_id: eventId,
            meta_response: fbJson,
          });
        }),
    },
  },
});
