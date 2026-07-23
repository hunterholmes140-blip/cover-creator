import { createFileRoute } from "@tanstack/react-router";
import { Target, Heart, Rocket } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের সম্পর্কে — NextScale Academy" },
      { name: "description", content: "NextScale Academy সম্পর্কে জানুন — আমাদের মিশন, ভিশন এবং টিম।" },
      { property: "og:title", content: "আমাদের সম্পর্কে" },
      { property: "og:description", content: "NextScale Academy-এর গল্প ও মিশন।" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">আমাদের সম্পর্কে</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            বাংলাদেশের অগ্রণী অনলাইন লার্নিং প্ল্যাটফর্ম, যেখানে ইন্ডাস্ট্রি এক্সপার্টরা শেখাচ্ছেন হাজারো শিক্ষার্থীকে।
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "আমাদের মিশন", desc: "প্রতিটি বাংলাদেশি তরুণের হাতে বিশ্বমানের শিক্ষা পৌঁছে দেওয়া।" },
            { icon: Rocket, title: "ভিশন", desc: "২০৩০ সালের মধ্যে ১০ লক্ষ শিক্ষার্থীর কর্মজীবন গড়তে সাহায্য করা।" },
            { icon: Heart, title: "মূল্যবোধ", desc: "সততা, মান এবং শিক্ষার্থীর সাফল্য — এগুলোই আমাদের অগ্রাধিকার।" },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-card p-6">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold">আমাদের গল্প</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            NextScale Academy শুরু হয়েছিল একটি সাধারণ চিন্তা থেকে — মানসম্পন্ন শিক্ষা যেন সবার জন্য access-able হয়।
            আজ আমাদের প্ল্যাটফর্মে ৫০+ কোর্স ও ১০,০০০+ শিক্ষার্থী রয়েছে। আমরা বিশ্বাস করি, সঠিক শিক্ষা যেকোনো
            জীবন পাল্টে দিতে পারে।
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
