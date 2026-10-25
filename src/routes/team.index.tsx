import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Users, Search, Filter, Sparkles, UserCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useTeam } from "@/lib/admin-store";
import { TEAM_DEPARTMENTS, TeamMember } from "@/lib/team-types";
import { TeamCard } from "@/components/site/TeamCard";

type TeamSearch = {
  dept?: string;
  department?: string;
  search?: string;
};

export const Route = createFileRoute("/team/")({
  validateSearch: (search: Record<string, unknown>): TeamSearch => {
    return {
      dept: typeof search.dept === "string" ? search.dept : undefined,
      department: typeof search.department === "string" ? search.department : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "আমাদের টিম — NextScale Academy" },
      { name: "description", content: "আমাদের দক্ষ ও নিবেদিত টিম সদস্যদের সাথে পরিচিত হোন।" },
      { property: "og:title", content: "টিম প্রোফাইল — NextScale" },
      { property: "og:description", content: "আমাদের অথর, ম্যানেজমেন্ট, সেলস ও লজিস্টিকস টিম।" },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const searchParams = useSearch({ from: "/team/" });
  const { items } = useTeam();
  const initialDept = searchParams.dept || searchParams.department || "all";
  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [query, setQuery] = useState<string>(searchParams.search || "");

  // Filter members based on department and search query
  const filteredMembers = useMemo(() => {
    return items.filter((m: TeamMember) => {
      // Department filter
      if (selectedDept !== "all") {
        const targetNorm = selectedDept.toLowerCase().trim();
        const memberDeptNorm = (m.department || "").toLowerCase().trim();
        const matches =
          memberDeptNorm === targetNorm ||
          (targetNorm.includes("logistic") &&
            targetNorm.includes("support") &&
            memberDeptNorm.includes("logistic") &&
            memberDeptNorm.includes("support"));
        if (!matches) return false;
      }

      // Search query filter (Name, ID, Designation, Phone, Email)
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchName = (m.name || "").toLowerCase().includes(q);
        const matchId = (m.employee_id || "").toLowerCase().includes(q);
        const matchDesignation = (m.designation || "").toLowerCase().includes(q);
        const matchEmail = (m.email || "").toLowerCase().includes(q);
        const matchPhone = (m.phone || "").toLowerCase().includes(q);
        return matchName || matchId || matchDesignation || matchEmail || matchPhone;
      }

      return true;
    });
  }, [items, selectedDept, query]);

  // Counts by department
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    TEAM_DEPARTMENTS.forEach((d) => {
      map[d.value] = items.filter(
        (m: TeamMember) => (m.department || "").toLowerCase() === d.value.toLowerCase()
      ).length;
    });
    return map;
  }, [items]);

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pb-20">
        {/* Hero Section */}
        <div className="relative border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NextScale অফিশিয়াল টিম</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight"
              style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}
            >
              আমাদের দক্ষ ও নিবেদিত টিম
            </h1>

            <p className="max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base leading-relaxed">
              শিক্ষা, গবেষণা, প্রশাসন ও লজিস্টিকসের মেলবন্ধনে যারা প্রতিনিয়ত শিক্ষার্থীদের অভিজ্ঞতা সমৃদ্ধ করতে কাজ করে যাচ্ছেন।
            </p>

            {/* Live Stats */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium">
                <Users className="h-4 w-4 text-primary" />
                <span>মোট সদস্য: <strong className="text-foreground">{items.length} জন</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>ডিপার্টমেন্ট: <strong className="text-foreground">{TEAM_DEPARTMENTS.length}টি</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Controls */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="নাম, পদবী বা এমপ্লয়ী আইডি (যেমন: EMP-101) খুঁজুন..."
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    মুছুন
                  </button>
                )}
              </div>

              {/* Reset filter button if active */}
              {(selectedDept !== "all" || query) && (
                <button
                  onClick={() => {
                    setSelectedDept("all");
                    setQuery("");
                  }}
                  className="text-xs font-medium text-primary hover:underline whitespace-nowrap self-end md:self-auto"
                >
                  সব ফিল্টার রিসেট করুন
                </button>
              )}
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setSelectedDept("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedDept === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                সকল ডিপার্টমেন্ট ({counts.all || 0})
              </button>

              {TEAM_DEPARTMENTS.map((dept) => {
                const active =
                  selectedDept.toLowerCase() === dept.value.toLowerCase() ||
                  (selectedDept.toLowerCase().includes("support") && dept.value === "Logictics Support");
                const count = counts[dept.value] || 0;

                return (
                  <button
                    key={dept.value}
                    type="button"
                    onClick={() => setSelectedDept(dept.value)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span>{dept.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active ? "bg-primary-foreground/20 text-white" : "bg-background/80 text-foreground/70"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Member Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/40">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
              <h3 className="text-lg font-bold text-foreground">কোনো টিম মেম্বার পাওয়া যায়নি</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                আপনার অনুসন্ধানের সাথে মিলে এমন কোনো কর্মী বর্তমানে এই বিভাগে তালিকাভুক্ত নেই।
              </p>
              <button
                onClick={() => {
                  setSelectedDept("all");
                  setQuery("");
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member: TeamMember) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
