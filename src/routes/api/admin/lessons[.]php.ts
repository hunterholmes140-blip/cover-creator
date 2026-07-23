import { createFileRoute } from "@tanstack/react-router";
import { q, exec } from "@/lib/db.server";
import { handle, ok, requireAdmin, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/lessons[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const url = new URL(request.url);
          const courseId = Number(url.searchParams.get("course_id"));
          if (!courseId) return fail(400, "course_id প্রয়োজন");
          const lessons = await q(
            `SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC, id ASC`,
            [courseId],
          );
          return ok({ lessons });
        }),

      POST: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const b = await request.json().catch(() => ({}));
          if (!b.course_id || !b.title) return fail(400, "course_id ও title প্রয়োজন");
          const res = await exec(
            `INSERT INTO lessons (course_id, title, video_url, content, sort_order, is_preview) VALUES (?,?,?,?,?,?)`,
            [Number(b.course_id), b.title, b.video_url ?? null, b.content ?? null, Number(b.sort_order ?? 0), b.is_preview ? 1 : 0],
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
            `UPDATE lessons SET title=?, video_url=?, content=?, sort_order=?, is_preview=? WHERE id=?`,
            [b.title, b.video_url ?? null, b.content ?? null, Number(b.sort_order ?? 0), b.is_preview ? 1 : 0, id],
          );
          return ok({ id });
        }),

      DELETE: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);
          const url = new URL(request.url);
          const id = Number(url.searchParams.get("id"));
          if (!id) return fail(400, "id প্রয়োজন");
          await exec(`DELETE FROM lessons WHERE id = ?`, [id]);
          return ok({ id });
        }),
    },
  },
});
