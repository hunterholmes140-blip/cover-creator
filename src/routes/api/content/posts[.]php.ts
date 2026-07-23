import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok, fail } from "@/lib/auth.server";

export const Route = createFileRoute("/api/content/posts[.]php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const row = await qOne<any>(
            `SELECT content_json FROM site_content WHERE content_key = 'posts' LIMIT 1`,
          );
          let posts: any[] = [];
          if (row) { try { posts = JSON.parse(row.content_json); } catch {} }
          const url = new URL(request.url);
          const slug = url.searchParams.get("slug");
          if (slug) {
            const post = posts.find((p) => p.slug === slug);
            if (!post) return fail(404, "আর্টিকেল পাওয়া যায়নি");
            return ok({ post });
          }
          return ok({ posts });
        }),
    },
  },
});
