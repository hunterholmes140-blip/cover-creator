export const TEAM_DEPARTMENTS = [
  {
    value: "Author",
    label: "Author",
    labelBn: "অথর / লেখক",
    description: "কনটেন্ট ও কোর্স মেটেরিয়াল প্রস্তুতকারক",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    value: "Management",
    label: "Management",
    labelBn: "ম্যানেজমেন্ট",
    description: "কোম্পানি পরিচালনা ও কৌশলগত নেতৃত্ব",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    value: "Sales",
    label: "Sales",
    labelBn: "সেলস",
    description: "মার্কেট গ্রোথ ও স্টুডেন্ট কাউন্সেলিং",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    value: "Logistics",
    label: "Logistics",
    labelBn: "লজিস্টিকস",
    description: "রিসোর্স ও ইনভেন্টরি ব্যবস্থাপনা",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    value: "Logictics Support",
    label: "Logictics Support",
    labelBn: "লজিস্টিকস সাপোর্ট",
    description: "অপারেশনাল সহায়তা ও মাঠ পর্যায়ের সমন্বয়",
    badgeColor: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    gradient: "from-orange-500 to-rose-600",
  },
  {
    value: "Others",
    label: "Others",
    labelBn: "অন্যান্য",
    description: "আইটি ও সহায়ক অন্যান্য দায়িত্ব",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    gradient: "from-slate-600 to-zinc-700",
  },
] as const;

export type TeamDepartment = (typeof TEAM_DEPARTMENTS)[number]["value"];

export interface TeamMember {
  id: string | number;
  employee_id: string; // সবার আইডি লেখার ইউনিক ইনপুট
  slug: string;
  name: string;
  department: TeamDepartment | string;
  designation: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  bio?: string;
  joining_date?: string;
  blood_group?: string;
  location?: string;
  status?: "active" | "inactive";
  social?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export function getDepartmentMeta(deptName: string) {
  const norm = (deptName || "").toLowerCase().trim();
  const found = TEAM_DEPARTMENTS.find(
    (d) =>
      d.value.toLowerCase() === norm ||
      d.label.toLowerCase() === norm ||
      (norm.includes("logistic") && norm.includes("support") && d.value === "Logictics Support")
  );
  return (
    found || {
      value: deptName as TeamDepartment,
      label: deptName || "General",
      labelBn: deptName || "অন্যান্য",
      description: "টিম সদস্য",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      gradient: "from-slate-500 to-zinc-600",
    }
  );
}

export function getProfileUrl(member: { id: any; employee_id?: string; slug?: string }): string {
  const identifier = member.employee_id ? encodeURIComponent(member.employee_id) : member.slug || String(member.id);
  if (typeof window !== "undefined") {
    return `${window.location.origin}/team/${identifier}`;
  }
  return `/team/${identifier}`;
}
