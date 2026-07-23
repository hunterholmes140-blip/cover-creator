import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok, fail, verifyPassword, signToken } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/admin-login[.]php")({
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
            [email],
          );
          if (!admin) return fail(401, "ভুল ক্রেডেনশিয়াল");
          const okPw = await verifyPassword(password, admin.password);
          if (!okPw) return fail(401, "ভুল ক্রেডেনশিয়াল");

          const token = signToken({ id: admin.id, email: admin.email, role: "admin" });
          return ok({
            user: { id: admin.id, name: admin.name, email: admin.email, role: "admin" },
            token,
          });
        }),
    },
  },
});
