import { createFileRoute } from "@tanstack/react-router";
import { q } from "@/lib/db.server";
import { handle, ok } from "@/lib/auth.server";

export const Route = createFileRoute("/api/courses/categories.php")({
  server: {
    handlers: {
      GET: async () =>
        handle(async () => {
          const categories = await q(`SELECT * FROM categories ORDER BY name ASC`);
          return ok({ categories });
        }),
    },
  },
});
