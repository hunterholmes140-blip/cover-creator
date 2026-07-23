import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail, hashPassword, verifyPassword, signToken } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/register.php")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        handle(async () => {
          const body = await request.json().catch(() => ({}));
          const name = String(body.name || "").trim();
          const email = String(body.email || "").trim().toLowerCase();
          const phone = String(body.phone || "").trim() || null;
          const password = String(body.password || "");
          if (!name || !email || !password) return fail(400, "সব ফিল্ড পূরণ করুন");
          if (password.length < 6) return fail(400, "পাসওয়ার্ড ৬ অক্ষরের বেশি হতে হবে");

          const existing = await qOne(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
          if (existing) return fail(409, "এই ইমেইল আগেই ব্যবহৃত");

          const hash = await hashPassword(password);
          const res = await exec(
            `INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)`,
            [name, email, phone, hash],
          );
          const user = { id: res.insertId, name, email, phone };
          const token = signToken({ id: res.insertId, email, role: "user" });
          return ok({ user, token });
        }),

      // support fetch fallback
      OPTIONS: async () => new Response(null, { status: 204 }),
    },
  },
});
