import { createFileRoute } from "@tanstack/react-router";
import { q, exec } from "@/lib/db.server";
import { handle, ok, requireAdmin, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/categories[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const categories = await q(`SELECT * FROM categories ORDER BY name ASC`);
          return ok({ categories });
        }),

      POST: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const b = await request.json().catch(() => ({}));
          if (!b.name || !b.slug) return fail(400, "name ও slug প্রয়োজন");
          const res = await exec(`INSERT INTO categories (name, slug) VALUES (?, ?)`, [b.name, b.slug]);
          return ok({ id: res.insertId }, 201);
        }),

      PUT: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const b = await request.json().catch(() => ({}));
          const id = Number(b.id);
          if (!id) return fail(400, "id প্রয়োজন");
          await exec(`UPDATE categories SET name=?, slug=? WHERE id=?`, [b.name, b.slug, id]);
          return ok({ id });
        }),

      DELETE: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const url = new URL(request.url);
          const id = Number(url.searchParams.get("id"));
          if (!id) return fail(400, "id প্রয়োজন");
          await exec(`DELETE FROM categories WHERE id = ?`, [id]);
          return ok({ id });
        }),
    },
  },
});
