// Generic key/value content — public GET, admin PUT
import { createFileRoute } from "@tanstack/react-router";
import { qOne, exec } from "@/lib/db.server";
import { handle, ok, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/content[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const url = new URL(request.url);
          const key = url.searchParams.get("key");
          if (!key) return fail(400, "key প্রয়োজন");
          const row = await qOne<any>(
            `SELECT content_json FROM site_content WHERE content_key = ? LIMIT 1`,
            [key],
          );
          if (!row) return ok({ value: null });
          try {
            return ok({ value: JSON.parse(row.content_json) });
          } catch {
            return ok({ value: row.content_json });
          }
        }),
    },
  },
});
