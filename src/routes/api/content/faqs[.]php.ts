import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok } from "@/lib/auth.server";

export const Route = createFileRoute("/api/content/faqs[.]php")({
  server: {
    handlers: {
      GET: async () =>
        handle(async () => {
          const row = await qOne<any>(
            `SELECT content_json FROM site_content WHERE content_key = 'faqs' LIMIT 1`,
          );
          let faqs: any[] = [];
          if (row) { try { faqs = JSON.parse(row.content_json); } catch {} }
          return ok({ faqs });
        }),
    },
  },
});
