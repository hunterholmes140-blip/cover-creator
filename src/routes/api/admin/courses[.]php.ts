import { createFileRoute } from "@tanstack/react-router";
import { q, exec } from "@/lib/db.server";
import { handle, ok, requireAdmin, fail } from "@/lib/auth.server";

async function ensureBadgeColumn() {
  await exec(`ALTER TABLE courses ADD COLUMN badge TEXT DEFAULT NULL`).catch(() => {});
}

export const Route = createFileRoute("/api/admin/courses.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          await ensureBadgeColumn();
          const courses = await q(
            `SELECT c.*, cat.slug AS category_slug, cat.name AS category_name
             FROM courses c LEFT JOIN categories cat ON cat.id = c.category_id
             ORDER BY c.created_at DESC`,
          );
          const parsed = (courses || []).map((c: any) => {
            if (c.badge && typeof c.badge === "string") {
              try { c.badge = JSON.parse(c.badge); } catch {}
            }
            return c;
          });
          return ok({ courses: parsed });
        }),

      POST: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          await ensureBadgeColumn();
          const b = await request.json().catch(() => ({}));
          if (!b.title || !b.slug) return fail(400, "title ও slug প্রয়োজন");
          const badgeStr = b.badge ? (typeof b.badge === "string" ? b.badge : JSON.stringify(b.badge)) : null;
          const res = await exec(
            `INSERT INTO courses (title, slug, short_description, description, thumbnail, preview_video, price, discount_price, category_id, instructor, duration, level, is_published, is_featured, badge)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              b.title, b.slug, b.short_description ?? null, b.description ?? null,
              b.thumbnail ?? null, b.preview_video ?? null, Number(b.price ?? 0), b.discount_price ? Number(b.discount_price) : null,
              b.category_id ? Number(b.category_id) : null, b.instructor ?? null, b.duration ?? null,
              b.level ?? "beginner", b.is_published ? 1 : 0, b.is_featured ? 1 : 0, badgeStr,
            ],
          );
          return ok({ id: res.insertId }, 201);
        }),

      PUT: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          await ensureBadgeColumn();
          const b = await request.json().catch(() => ({}));
          const id = Number(b.id);
          if (!id) return fail(400, "id প্রয়োজন");
          const badgeStr = b.badge ? (typeof b.badge === "string" ? b.badge : JSON.stringify(b.badge)) : null;
          await exec(
            `UPDATE courses SET title=?, slug=?, short_description=?, description=?, thumbnail=?, preview_video=?, price=?, discount_price=?, category_id=?, instructor=?, duration=?, level=?, is_published=?, is_featured=?, badge=? WHERE id=?`,
            [
              b.title, b.slug, b.short_description ?? null, b.description ?? null,
              b.thumbnail ?? null, b.preview_video ?? null, Number(b.price ?? 0), b.discount_price ? Number(b.discount_price) : null,
              b.category_id ? Number(b.category_id) : null, b.instructor ?? null, b.duration ?? null,
              b.level ?? "beginner", b.is_published ? 1 : 0, b.is_featured ? 1 : 0, badgeStr, id,
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
