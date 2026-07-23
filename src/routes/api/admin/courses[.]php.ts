import { createFileRoute } from "@tanstack/react-router";
import { q, exec } from "@/lib/db.server";
import { handle, ok, requireAdmin, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/courses[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const courses = await q(
            `SELECT c.*, cat.slug AS category_slug, cat.name AS category_name
             FROM courses c LEFT JOIN categories cat ON cat.id = c.category_id
             ORDER BY c.created_at DESC`,
          );
          return ok({ courses });
        }),

      POST: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const b = await request.json().catch(() => ({}));
          if (!b.title || !b.slug) return fail(400, "title ও slug প্রয়োজন");
          const res = await exec(
            `INSERT INTO courses (title, slug, short_description, description, thumbnail, price, discount_price, category_id, instructor, duration, level, is_published, is_featured)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              b.title, b.slug, b.short_description ?? null, b.description ?? null,
              b.thumbnail ?? null, Number(b.price ?? 0), b.discount_price ? Number(b.discount_price) : null,
              b.category_id ? Number(b.category_id) : null, b.instructor ?? null, b.duration ?? null,
              b.level ?? "beginner", b.is_published ? 1 : 0, b.is_featured ? 1 : 0,
            ],
          );
          return ok({ id: res.insertId }, 201);
        }),

      PUT: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const b = await request.json().catch(() => ({}));
          const id = Number(b.id);
          if (!id) return fail(400, "id প্রয়োজন");
          await exec(
            `UPDATE courses SET title=?, slug=?, short_description=?, description=?, thumbnail=?, price=?, discount_price=?, category_id=?, instructor=?, duration=?, level=?, is_published=?, is_featured=? WHERE id=?`,
            [
              b.title, b.slug, b.short_description ?? null, b.description ?? null,
              b.thumbnail ?? null, Number(b.price ?? 0), b.discount_price ? Number(b.discount_price) : null,
              b.category_id ? Number(b.category_id) : null, b.instructor ?? null, b.duration ?? null,
              b.level ?? "beginner", b.is_published ? 1 : 0, b.is_featured ? 1 : 0, id,
            ],
          );
          return ok({ id });
        }),

      DELETE: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const url = new URL(request.url);
          const id = Number(url.searchParams.get("id"));
          if (!id) return fail(400, "id প্রয়োজন");
          await exec(`DELETE FROM courses WHERE id = ?`, [id]);
          return ok({ id });
        }),
    },
  },
});
