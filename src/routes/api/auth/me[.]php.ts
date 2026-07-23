import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok, fail, bearerFrom } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/me.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const p = bearerFrom(request);
          if (!p) return fail(401, "লগইন প্রয়োজন");
          if (p.role === "admin") {
            const a = await qOne(`SELECT id, name, email FROM admins WHERE id = ?`, [p.id]);
            return ok({ user: { ...(a as any), role: "admin" } });
          }
          const u = await qOne(`SELECT id, name, email, phone FROM users WHERE id = ?`, [p.id]);
          if (!u) return fail(401, "ইউজার পাওয়া যায়নি");
          return ok({ user: u });
        }),
    },
  },
});
