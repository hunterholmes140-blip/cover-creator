import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail, verifyPassword, signToken } from "@/lib/auth.server";

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

export const Route = createFileRoute("/api/auth/admin-login.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const body = await request.json().catch(() => ({}));
          const email = String(body.email || "").trim().toLowerCase();
          const password = String(body.password || "");
          if (!email || !password) return fail(400, "ইমেইল ও পাসওয়ার্ড দিন");

          const admin = await qOne<any>(
            `SELECT id, name, email, password FROM admins WHERE email = ? LIMIT 1`,
            [email]
          );

          if (!admin) return fail(401, "ভুল ক্রেডেনশিয়াল");
          const okPw = await verifyPassword(password, admin.password);
          if (!okPw) return fail(401, "ভুল ক্রেডেনশিয়াল");

          const token = signToken({ id: admin.id, email: admin.email, role: "admin" });

          // Record session in user_sessions table
          const userAgent = request.headers.get("user-agent") || "";
          const ipAddress = request.headers.get("x-forwarded-for") || "103.12.45.69";
          const { device_type, device_name } = parseDeviceName(userAgent);

          try {
            await exec(
              `INSERT INTO user_sessions (user_id, session_token, device_type, device_name, ip_address)
               VALUES (?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE last_active = CURRENT_TIMESTAMP`,
              [admin.id, token, device_type, device_name, ipAddress]
            );
          } catch (e) {
            console.warn("Failed to record device session:", e);
          }

          return ok({
            user: { id: admin.id, name: admin.name, email: admin.email, role: "admin" },
            token,
          });
        }),
    },
  },
});
