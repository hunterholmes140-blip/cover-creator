import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok, fail, verifyPassword, signToken } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/login[.]php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const body = await request.json().catch(() => ({}));
          const email = String(body.email || "").trim().toLowerCase();
          const password = String(body.password || "");
          if (!email || !password) return fail(400, "ইমেইল ও পাসওয়ার্ড দিন");

          const user = await qOne<any>(
            `SELECT id, name, email, phone, password FROM users WHERE email = ? LIMIT 1`,
            [email],
          );
          if (!user) return fail(401, "ভুল ইমেইল বা পাসওয়ার্ড");
          const okPw = await verifyPassword(password, user.password);
          if (!okPw) return fail(401, "ভুল ইমেইল বা পাসওয়ার্ড");

          const token = signToken({ id: user.id, email: user.email, role: "user" });
          return ok({
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
            token,
          });
        }),
    },
  },
});
