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

export type EmploymentType = "Permanent" | "Contractual" | "Probationary";
export type EmploymentStatus = "Active" | "Resigned" | "Suspended";
export type VerificationStatus = "Valid" | "Expired" | "Inactive";

export interface TeamMemberVisibility {
  phone?: boolean;
  email?: boolean;
  joining_date?: boolean;
  employment_type?: boolean;
  employment_status?: boolean;
  id_card_number?: boolean;
  id_card_dates?: boolean;
  remaining_validity?: boolean;
  blood_group?: boolean;
  location?: boolean;
  official_contact?: boolean;
  social?: boolean;
  bio?: boolean;
}

export const DEFAULT_VISIBILITY: TeamMemberVisibility = {
  phone: true,
  email: true,
  joining_date: true,
  employment_type: true,
  employment_status: true,
  id_card_number: true,
  id_card_dates: true,
  remaining_validity: true,
  blood_group: true,
  location: true,
  official_contact: true,
  social: true,
  bio: true,
};

export interface TeamMember {
  id: string | number;
  company_name?: string; // Company Name: Vencon
  employee_id: string; // Employee ID: ইউনিক আইডি
  slug: string;
  name: string; // Employee Name: কর্মীর পূর্ণ নাম
  department: TeamDepartment | string; // Department: বিভাগ
  designation: string; // Designation: পদবি
  avatar_url?: string; // Employee Photo: অফিসিয়াল ছবি
  email?: string;
  phone?: string;
  bio?: string;
  
  // Employment Details
  employment_type?: EmploymentType | string; // Permanent / Contractual / Probationary
  joining_date?: string; // যোগদানের তারিখ
  employment_status?: EmploymentStatus | string; // Active / Resigned / Suspended
  
  // ID Card & Validity Details
  id_card_number?: string; // পরিচয়পত্র নম্বর (যেমন: VEN-ID-90823)
  id_card_issue_date?: string; // ইস্যুর তারিখ
  id_card_expiry_date?: string; // মেয়াদ শেষ হওয়ার তারিখ
  validation_period?: string; // মোট বৈধতার মেয়াদ (যেমন: ৩ বছর / 3 Years)
  verification_status?: VerificationStatus | string; // Valid / Expired / Inactive
  last_updated?: string; // সর্বশেষ তথ্য আপডেটের তারিখ
  official_contact?: string; // Vencon-এর অফিসিয়াল যোগাযোগ
  
  // Other particulars
  blood_group?: string;
  location?: string;
  status?: "active" | "inactive";
  
  // Public Visibility Preferences
  visibility?: TeamMemberVisibility;
  
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

/**
 * Calculates remaining validity days from expiry date.
 * Returns negative if expired, 0 if expires today, positive if remaining.
 */
export function getRemainingValidityDays(expiryDateStr?: string): number | null {
  if (!expiryDateStr) return null;
  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats the remaining validity for user display.
 */
export function formatRemainingValidity(expiryDateStr?: string): { text: string; isExpired: boolean; days: number | null } {
  const days = getRemainingValidityDays(expiryDateStr);
  if (days === null) {
    return { text: "মেয়াদ নির্ধারিত নেই", isExpired: false, days: null };
  }
  if (days < 0) {
    return { text: `মেয়াদ উত্তীর্ণ (${Math.abs(days)} দিন আগে)`, isExpired: true, days };
  }
  if (days === 0) {
    return { text: "আজই মেয়াদ শেষ হবে", isExpired: false, days: 0 };
  }
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remDays = days % 30;
  
  let parts: string[] = [];
  if (years > 0) parts.push(`${years} বছর`);
  if (months > 0) parts.push(`${months} মাস`);
  if (remDays > 0 || parts.length === 0) parts.push(`${remDays} দিন`);
  
  return {
    text: `${parts.join(" ")} বাকি (${days} দিন)`,
    isExpired: false,
    days,
  };
}

/**
 * Derives effective verification status considering employment status and expiration.
 */
export function getEffectiveVerificationStatus(member: TeamMember): {
  status: "Valid" | "Expired" | "Inactive";
  badgeColor: string;
  labelBn: string;
} {
  const empStatus = (member.employment_status || "Active").toLowerCase();
  if (empStatus === "resigned" || empStatus === "suspended" || member.status === "inactive") {
    return {
      status: "Inactive",
      badgeColor: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
      labelBn: "নিষ্ক্রিয় (Inactive)",
    };
  }

  const days = getRemainingValidityDays(member.id_card_expiry_date);
  if (days !== null && days < 0) {
    return {
      status: "Expired",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      labelBn: "মেয়াদ উত্তীর্ণ (Expired)",
    };
  }

  if (member.verification_status === "Expired") {
    return {
      status: "Expired",
      badgeColor: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      labelBn: "মেয়াদ উত্তীর্ণ (Expired)",
    };
  }

  if (member.verification_status === "Inactive") {
    return {
      status: "Inactive",
      badgeColor: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
      labelBn: "নিষ্ক্রিয় (Inactive)",
    };
  }

  return {
    status: "Valid",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    labelBn: "বৈধ ও অনুমোদিত (Valid)",
  };
}
