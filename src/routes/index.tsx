import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "নতুন সাইট" },
      { name: "description", content: "শীঘ্রই আসছে।" },
    ],
  }),
  component: BlankPage,
});

function BlankPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">নতুন সাইটের জন্য প্রস্তুত</h1>
        <p className="mt-3 text-muted-foreground">পরের বার্তায় আপনার প্ল্যান জানান।</p>
      </div>
    </div>
  );
}
