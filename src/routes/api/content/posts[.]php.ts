import { createFileRoute } from "@tanstack/react-router";
import { qOne } from "@/lib/db.server";
import { handle, ok, fail } from "@/lib/auth.server";
import { MOCK_POSTS } from "@/lib/mock-data";

export const Route = createFileRoute("/api/content/posts.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          const row = await qOne<any>(
            `SELECT content_json FROM site_content WHERE content_key = 'posts' LIMIT 1`,
          );
          let posts: any[] = MOCK_POSTS as any[];
          if (row) { try { posts = JSON.parse(row.content_json); } catch {} }
          if (!Array.isArray(posts) || posts.length === 0) posts = MOCK_POSTS as any[];
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
