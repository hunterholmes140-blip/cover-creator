import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/orders")({
  component: () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">অর্ডার লিস্ট</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        অর্ডার ও পেমেন্ট PHP API-এর সাথে যুক্ত হলে এখানে দেখা যাবে।
      </p>
    </div>
  ),
});
