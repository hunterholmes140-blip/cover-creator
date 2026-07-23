import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/trainers")({
  component: () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">ট্রেনার ম্যানেজমেন্ট</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ট্রেনার প্রোফাইল যোগ ও এডিট করার UI শীঘ্রই আসছে।
      </p>
    </div>
  ),
});
