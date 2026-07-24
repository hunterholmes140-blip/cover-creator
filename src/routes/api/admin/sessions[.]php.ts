import { createFileRoute } from "@tanstack/react-router";
import { q, exec } from "@/lib/db.server";
import { handle, ok, fail, requireAdmin } from "@/lib/auth.server";

function parseDeviceName(userAgent: string): { device_type: string; device_name: string } {
  let os = "Desktop";
  let browser = "Browser";
  let device_type = "desktop";

  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
  else if (/iphone|ipad|ipod/i.test(userAgent)) { os = "iOS"; device_type = "mobile"; }
  else if (/android/i.test(userAgent)) { os = "Android"; device_type = "mobile"; }
  else if (/linux/i.test(userAgent)) os = "Linux";

  if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent)) browser = "Safari";

  return {
    device_type,
    device_name: `${os} • ${browser}`,
  };
}

export const Route = createFileRoute("/api/admin/sessions.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const user = requireAdmin(request);
          const authHeader = request.headers.get("authorization") || "";
          const currentToken = authHeader.replace("Bearer ", "").trim();

          let sessions = await q<any>(
            `SELECT id, session_token, device_type, device_name, ip_address, last_active, created_at
             FROM user_sessions WHERE user_id = ? ORDER BY last_active DESC`,
            [user.id]
          );

          const hasCurrent = sessions.some((s: any) => s.session_token === currentToken);

          // Auto-register current device if not found in database yet
          if (!hasCurrent && currentToken) {
            const userAgent = request.headers.get("user-agent") || "";
            const ipAddress = request.headers.get("x-forwarded-for") || "103.12.45.69";
            const { device_type, device_name } = parseDeviceName(userAgent);

            try {
              await exec(
                `INSERT INTO user_sessions (user_id, session_token, device_type, device_name, ip_address)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE last_active = CURRENT_TIMESTAMP`,
                [user.id, currentToken, device_type, device_name, ipAddress]
              );

              sessions = await q<any>(
                `SELECT id, session_token, device_type, device_name, ip_address, last_active, created_at
                 FROM user_sessions WHERE user_id = ? ORDER BY last_active DESC`,
                [user.id]
              );
            } catch (err) {
              console.warn("Failed to auto-register current session:", err);
            }
          }

          const mapped = sessions.map((s: any) => ({
            ...s,
            is_current: s.session_token === currentToken || sessions.length === 1,
          }));

          return ok(mapped);
        }),

      DELETE: async ({ request }) =>
        handle(async () => {
          const user = requireAdmin(request);
          const url = new URL(request.url);
          const sessionId = url.searchParams.get("id");
          const action = url.searchParams.get("action");
          const authHeader = request.headers.get("authorization") || "";
          const currentToken = authHeader.replace("Bearer ", "").trim();

          if (action === "all_others") {
            await exec(
              `DELETE FROM user_sessions WHERE user_id = ? AND session_token != ?`,
              [user.id, currentToken]
            );
            return ok({ message: "অন্যান্য সকল ডিভাইস থেকে লগআউট করা হয়েছে।" });
          }

          if (sessionId) {
            await exec(
              `DELETE FROM user_sessions WHERE id = ? AND user_id = ?`,
              [Number(sessionId), user.id]
            );
            return ok({ message: "ডিভাইসটি সফলভাবে রিমুভ করা হয়েছে।" });
          }

          return fail(400, "অ্যাকশন বা আইডি প্রদান করুন।");
        }),
    },
  },
});
