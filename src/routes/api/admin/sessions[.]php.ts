import { createFileRoute } from "@tanstack/react-router";
import { q, exec } from "@/lib/db.server";
import { handle, ok, fail, requireAdmin, bearerFrom } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/sessions.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const user = requireAdmin(request);
          const authHeader = request.headers.get("authorization") || "";
          const currentToken = authHeader.replace("Bearer ", "").trim();

          const sessions = await q<any>(
            `SELECT id, session_token, device_type, device_name, ip_address, last_active, created_at
             FROM user_sessions WHERE user_id = ? ORDER BY last_active DESC`,
            [user.id]
          );

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
