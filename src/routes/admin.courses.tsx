import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/courses")({
  component: () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">কোর্স ম্যানেজমেন্ট</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        এই সেকশন শীঘ্রই PHP API-এর সাথে যুক্ত হবে। বর্তমানে কোর্সগুলো mock ডেটা থেকে আসছে।
      </p>
    </div>
  ),
});
