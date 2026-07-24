import { createFileRoute } from "@tanstack/react-router";
import { q, qOne } from "@/lib/db.server";
import { handle, ok, requireAdmin } from "@/lib/auth.server";

export const Route = createFileRoute("/api/admin/analytics.php")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        handle(async () => {
          requireAdmin(request);

          // 1. Overall Summary Metrics
          const totalRevenueRow = await qOne<any>(
            `SELECT COALESCE(SUM(amount), 0) AS total_revenue, COUNT(*) AS total_orders
             FROM orders WHERE status = 'approved' OR payment_method = 'eps_online'`
          );

          const totalStudentsRow = await qOne<any>(
            `SELECT COUNT(DISTINCT user_id) AS total_students FROM orders`
          );

          // 2. Course-wise Sales Breakdown
          const courseSales = await q<any>(
            `SELECT 
              c.id AS course_id,
              c.title,
              c.thumbnail,
              c.price,
              c.discount_price,
              COUNT(o.id) AS sales_count,
              COALESCE(SUM(o.amount), 0) AS total_revenue
             FROM courses c
             LEFT JOIN orders o ON o.course_id = c.id AND (o.status = 'approved' OR o.payment_method = 'eps_online')
             GROUP BY c.id, c.title, c.thumbnail, c.price, c.discount_price
             ORDER BY total_revenue DESC, sales_count DESC`
          );

          const grandTotal = Number(totalRevenueRow?.total_revenue || 0);

          const courseSalesWithShare = courseSales.map((item: any) => {
            const rev = Number(item.total_revenue || 0);
            const count = Number(item.sales_count || 0);
            const share = grandTotal > 0 ? Math.round((rev / grandTotal) * 100) : 0;
            return {
              ...item,
              sales_count: count,
              total_revenue: rev,
              percentage_share: share,
            };
          });

          const topCourse = courseSalesWithShare.length > 0 ? courseSalesWithShare[0].title : "N/A";

          // 3. Monthly Sales Trends (Last 6 Months)
          const monthlyTrends = await q<any>(
            `SELECT 
              DATE_FORMAT(created_at, '%b %Y') AS month_label,
              COUNT(*) AS orders_count,
              COALESCE(SUM(amount), 0) AS revenue
             FROM orders
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(created_at, '%b %Y')
             ORDER BY MIN(created_at) ASC`
          );

          return ok({
            summary: {
              total_revenue: grandTotal,
              total_orders: Number(totalRevenueRow?.total_orders || 0),
              total_students: Number(totalStudentsRow?.total_students || 0),
              top_course: topCourse,
            },
            course_sales: courseSalesWithShare,
            monthly_trends: monthlyTrends,
          });
        }),
    },
  },
});
