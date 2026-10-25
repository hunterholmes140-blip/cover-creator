import { useState, useMemo } from "react";
import { makeSlug } from "@/lib/admin-store";
import { Field, Input, Textarea, Button, Card } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  TEAM_DEPARTMENTS,
  TeamDepartment,
  TeamMember,
  EmploymentType,
  EmploymentStatus,
  VerificationStatus,
  TeamMemberVisibility,
  DEFAULT_VISIBILITY,
  getDepartmentMeta,
  formatRemainingValidity,
  getEffectiveVerificationStatus,
} from "@/lib/team-types";
import { EmployeeQrCode } from "@/components/site/EmployeeQrCode";
import {
  QrCode,
  Sparkles,
  User,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Heart,
  MapPin,
  ShieldCheck,
  CreditCard,
  Eye,
  EyeOff,
  Clock,
  Building,
  CheckCircle2,
} from "lucide-react";

export type TeamFormValue = {
  company_name: string;
  employee_id: string;
  name: string;
  slug: string;
  department: TeamDepartment;
  designation: string;
  avatar_url: string;
  email: string;
  phone: string;
  bio: string;
  
  // Employment Details
  employment_type: EmploymentType;
  joining_date: string;
  employment_status: EmploymentStatus;
  
  // ID Card & Verification Details
  id_card_number: string;
  id_card_issue_date: string;
  id_card_expiry_date: string;
  validation_period: string;
  verification_status: VerificationStatus;
  last_updated: string;
  official_contact: string;

  // Additional Particulars
  blood_group: string;
  location: string;
  status: "active" | "inactive";

  // Public Visibility Preferences
  visibility: TeamMemberVisibility;

  social: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
};

export const emptyTeamMember: TeamFormValue = {
  company_name: "Vencon",
  employee_id: "",
  name: "",
  slug: "",
  department: "Management",
  designation: "",
  avatar_url: "",
  email: "",
  phone: "",
  bio: "",
  employment_type: "Permanent",
  joining_date: new Date().toISOString().split("T")[0],
  employment_status: "Active",
  id_card_number: "",
  id_card_issue_date: new Date().toISOString().split("T")[0],
  id_card_expiry_date: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  validation_period: "৩ বছর (3 Years)",
  verification_status: "Valid",
  last_updated: new Date().toISOString().split("T")[0],
  official_contact: "Vencon Official: info@vencon.com.bd | +880 1700-000000 | Dhaka, Bangladesh",
  blood_group: "B+",
  location: "ঢাকা হেড অফিস",
  status: "active",
  visibility: { ...DEFAULT_VISIBILITY },
  social: {},
};

export function TeamForm({
  initial,
  onSave,
  saving = false,
}: {
  initial: TeamFormValue;
  onSave: (val: TeamFormValue) => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState<TeamFormValue>({
    ...emptyTeamMember,
    ...initial,
    visibility: {
      ...DEFAULT_VISIBILITY,
      ...(initial.visibility || {}),
    },
  });

  const deptMeta = getDepartmentMeta(form.department);

  const update = <K extends keyof TeamFormValue>(key: K, val: TeamFormValue[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      // Auto-generate slug if name changed
      if (key === "name" && (!prev.slug || prev.slug === makeSlug(prev.name))) {
        next.slug = makeSlug(val as string);
      }
      return next;
    });
  };

  const updateVisibility = (key: keyof TeamMemberVisibility, val: boolean) => {
    setForm((prev) => ({
      ...prev,
      visibility: {
        ...(prev.visibility || DEFAULT_VISIBILITY),
        [key]: val,
      },
    }));
  };

  const updateSocial = (key: string, val: string) => {
    setForm((prev) => ({
      ...prev,
      social: { ...prev.social, [key]: val },
    }));
  };

  // Auto-generate Employee ID helper
  const autoSuggestId = () => {
    const prefix = form.department.substring(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    update("employee_id", `${prefix}-${rand}`);
  };

  // Auto-generate ID Card Number helper
  const autoSuggestIdCardNumber = () => {
    const deptCode = form.department.substring(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    update("id_card_number", `VNC-${deptCode}-${rand}`);
  };

  // Calculate dynamic remaining validity
  const remainingValidity = useMemo(() => {
    return formatRemainingValidity(form.id_card_expiry_date);
  }, [form.id_card_expiry_date]);

  // Derived effective verification status
  const effectiveStatus = useMemo(() => {
    return getEffectiveVerificationStatus(form as any);
  }, [form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("দয়া করে এমপ্লয়ীর নাম লিখুন");
    if (!form.employee_id.trim()) return alert("দয়া করে এমপ্লয়ী আইডি লিখুন");

    // Automatically stamp today's date for last_updated
    const payload = {
      ...form,
      last_updated: new Date().toISOString().split("T")[0],
    };
    onSave(payload);
  };

  // Preview object for the live QR Code
  const previewMember = {
    id: form.employee_id || "preview",
    company_name: form.company_name || "Vencon",
    employee_id: form.employee_id || "EMP-TEMP",
    slug: form.slug || makeSlug(form.name) || "employee",
    name: form.name || "এমপ্লয়ীর নাম",
    department: form.department,
    designation: form.designation || "পদবী",
    avatar_url: form.avatar_url,
    verification_status: form.verification_status,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Basic & Corporate Identification Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Building className="h-4 w-4 text-primary" />
              প্রতিষ্ঠান ও কর্মী পরিচিতি (Basic & Company Information)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <Field label="প্রতিষ্ঠানের নাম (Company Name) *" hint="যেমন: Vencon">
                <Input
                  required
                  value={form.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                  placeholder="Vencon"
                  className="font-semibold"
                />
              </Field>

              {/* Department */}
              <Field label="ডিপার্টমেন্ট / বিভাগ (পদ নির্ধারণ) *" hint="কর্মীর ডিপার্টমেন্ট নির্ধারণ করুন">
                <select
                  required
                  value={form.department}
                  onChange={(e) => update("department", e.target.value as TeamDepartment)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                >
                  {TEAM_DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label} ({d.labelBn})
                    </option>
                  ))}
                </select>
              </Field>

              {/* Employee ID */}
              <Field label="এমপ্লয়ী আইডি (Employee ID) *" hint="ইউনিক আইডি যা কার্ড এবং QR কোডে ব্যবহৃত হবে">
                <div className="flex gap-2">
                  <Input
                    required
                    value={form.employee_id}
                    onChange={(e) => update("employee_id", e.target.value.trim().toUpperCase())}
                    placeholder="যেমন: AUTH-101, MGT-201"
                    className="font-mono font-bold"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={autoSuggestId}
                    className="whitespace-nowrap text-xs"
                    title="স্বয়ংক্রিয় আইডি তৈরি করুন"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> অটো
                  </Button>
                </div>
              </Field>

              {/* Designation */}
              <Field label="পদবি (Designation) *" hint="যেমন: Managing Director, Senior Author">
                <Input
                  required
                  value={form.designation}
                  onChange={(e) => update("designation", e.target.value)}
                  placeholder="যেমন: চিফ স্ট্র্যাটেজিস্ট / লিড অথর"
                />
              </Field>

              {/* Full Name */}
              <div className="sm:col-span-2">
                <Field label="কর্মীর পূর্ণ নাম (Employee Name) *" hint="অফিশিয়াল সনদে ব্যবহৃত নাম">
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="যেমন: ফারাজুল ইসলাম"
                  />
                </Field>
              </div>
            </div>

            {/* Photo / Avatar Upload */}
            <Field label="অফিসিয়াল ছবি (Employee Photo)" hint="কর্মীর পাসপোর্ট সাইজ বা অফিশিয়াল ছবি আপলোড করুন">
              <ImageUpload
                value={form.avatar_url}
                onChange={(url) => update("avatar_url", url)}
                aspect="square"
                previewClassName="h-28 w-28 rounded-full"
              />
            </Field>

            {/* Bio */}
            <Field label="পরিচিতি ও দায়িত্ব (Bio)" hint="কর্মীর ভূমিকা ও কর্মক্ষেত্র">
              <Textarea
                rows={3}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="এখানে কর্মীর অভিজ্ঞতা, দায়িত্ব বা ভূমিকা লিখুন..."
              />
            </Field>
          </Card>

          {/* 2. Employment & Service Particulars */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Briefcase className="h-4 w-4 text-primary" />
              চাকরির ধরণ ও স্ট্যাটাস (Employment & Service Details)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Employment Type */}
              <Field label="চাকরির ধরণ (Employment Type) *" hint="Permanent / Contractual / Probationary">
                <select
                  value={form.employment_type}
                  onChange={(e) => update("employment_type", e.target.value as EmploymentType)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                >
                  <option value="Permanent">Permanent (স্থায়ী)</option>
                  <option value="Contractual">Contractual (চুক্তিভিত্তিক)</option>
                  <option value="Probationary">Probationary (শিক্ষানবিস)</option>
                </select>
              </Field>

              {/* Joining Date */}
              <Field label="যোগদানের তারিখ (Joining Date) *">
                <Input
                  type="date"
                  value={form.joining_date}
                  onChange={(e) => update("joining_date", e.target.value)}
                />
              </Field>

              {/* Employment Status */}
              <Field label="চাকরির বর্তমান অবস্থা (Status) *" hint="Active / Resigned / Suspended">
                <select
                  value={form.employment_status}
                  onChange={(e) => update("employment_status", e.target.value as EmploymentStatus)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                >
                  <option value="Active">Active (কর্মরত / সক্রিয়)</option>
                  <option value="Resigned">Resigned (পদত্যাগকৃত)</option>
                  <option value="Suspended">Suspended (স্থগিত)</option>
                </select>
              </Field>
            </div>
          </Card>

          {/* 3. Official ID Card, Validity & Verification Specs */}
          <Card className="p-6 space-y-4 border-2 border-primary/10">
            <h3 className="text-sm font-bold text-foreground flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                অফিসিয়াল আইডি কার্ড ও মেয়াদ (ID Card & Verification Details)
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${effectiveStatus.badgeColor}`}>
                {effectiveStatus.labelBn}
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* ID Card Number */}
              <Field label="পরিচয়পত্র নম্বর (ID Card Number) *" hint="যেমন: VNC-ID-884920">
                <div className="flex gap-2">
                  <Input
                    required
                    value={form.id_card_number}
                    onChange={(e) => update("id_card_number", e.target.value)}
                    placeholder="VNC-ID-XXXX"
                    className="font-mono font-bold"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={autoSuggestIdCardNumber}
                    className="whitespace-nowrap text-xs"
                    title="আইডি কার্ড নম্বর তৈরি"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> অটো
                  </Button>
                </div>
              </Field>

              {/* Verification Status */}
              <Field label="যাচাইকরণ অবস্থা (Verification Status) *" hint="Valid / Expired / Inactive">
                <select
                  value={form.verification_status}
                  onChange={(e) => update("verification_status", e.target.value as VerificationStatus)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                >
                  <option value="Valid">Valid (বৈধ ও অনুমোদিত)</option>
                  <option value="Expired">Expired (মেয়াদ উত্তীর্ণ)</option>
                  <option value="Inactive">Inactive (নিষ্ক্রিয়)</option>
                </select>
              </Field>

              {/* Issue Date */}
              <Field label="ইস্যুর তারিখ (ID Card Issue Date)">
                <Input
                  type="date"
                  value={form.id_card_issue_date}
                  onChange={(e) => update("id_card_issue_date", e.target.value)}
                />
              </Field>

              {/* Expiry Date */}
              <Field label="মেয়াদ শেষ হওয়ার তারিখ (Expiry Date)">
                <Input
                  type="date"
                  value={form.id_card_expiry_date}
                  onChange={(e) => update("id_card_expiry_date", e.target.value)}
                />
              </Field>

              {/* Validation Period */}
              <Field label="মোট বৈধতার মেয়াদ (Validation Period)" hint="যেমন: ৩ বছর (3 Years)">
                <Input
                  value={form.validation_period}
                  onChange={(e) => update("validation_period", e.target.value)}
                  placeholder="যেমন: ৩ বছর (3 Years)"
                />
              </Field>

              {/* Remaining Validity - Live Display */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  আর কত দিন বৈধ আছে (Remaining Validity)
                </label>
                <div className={`p-2.5 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
                  remainingValidity.isExpired
                    ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                }`}>
                  <Clock className="h-4 w-4" />
                  <span>{remainingValidity.text}</span>
                </div>
              </div>

              {/* Official Verification Contact */}
              <div className="sm:col-span-2">
                <Field
                  label="অফিসিয়াল যোগাযোগ (Official Verification Contact)"
                  hint="কার্ড ভেরিফিকেশনে প্রদর্শিত Vencon-এর অফিশিয়াল হেল্পলাইন বা ইমেইল"
                >
                  <Input
                    value={form.official_contact}
                    onChange={(e) => update("official_contact", e.target.value)}
                    placeholder="Vencon HQ: info@vencon.com.bd | +880 1700-000000 | Dhaka"
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* 4. Public Visibility Controls (প্রোফাইলে কোন কোন ডাটা দেখতে পাবে কিংবা পাবে না) */}
          <Card className="p-6 space-y-4 border-2 border-emerald-500/20 bg-emerald-500/[0.02]">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" />
                পাবলিক প্রোফাইল ভিজিবিলিটি সেটিংস (Public Visibility Controls)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                প্রোফাইলে সাধারণ ভিজিটর কোন কোন তথ্য দেখতে পারবে তা এখান থেকে সিলেক্ট করুন (টিক চিহ্ন = দৃশ্যমান, আনচেক = গোপন):
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: "phone" as const, label: "মোবাইল নম্বর (Phone Number)" },
                { key: "email" as const, label: "অফিশিয়াল ইমেইল (Official Email)" },
                { key: "joining_date" as const, label: "যোগদানের তারিখ (Joining Date)" },
                { key: "employment_type" as const, label: "চাকরির ধরণ (Employment Type)" },
                { key: "employment_status" as const, label: "চাকরির স্ট্যাটাস (Employment Status)" },
                { key: "id_card_number" as const, label: "আইডি কার্ড নম্বর (ID Card Number)" },
                { key: "id_card_dates" as const, label: "ইস্যু ও মেয়াদ শেষের তারিখ (Issue & Expiry)" },
                { key: "remaining_validity" as const, label: "অবশিষ্ট মেয়াদ (Remaining Validity Days)" },
                { key: "blood_group" as const, label: "রক্তের গ্রুপ (Blood Group)" },
                { key: "location" as const, label: "কর্মস্থল / পোস্টিং (Office Location)" },
                { key: "official_contact" as const, label: "অফিসিয়াল ভেরিফিকেশন কন্টাক্ট (Vencon Contact)" },
                { key: "bio" as const, label: "পরিচিতি ও দায়িত্ব (Bio & Roles)" },
                { key: "social" as const, label: "সামাজিক মাধ্যম লিংক (Social Links)" },
              ].map(({ key, label }) => {
                const isChecked = form.visibility[key] !== false;
                return (
                  <label
                    key={key}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-card border-emerald-500/30 text-foreground shadow-xs"
                        : "bg-muted/40 border-border text-muted-foreground opacity-60"
                    }`}
                  >
                    <span className="font-medium pr-2">{label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => updateVisibility(key, e.target.checked)}
                      className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-border cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </Card>

          {/* 5. Contact & Socials */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Mail className="h-4 w-4 text-primary" />
              ব্যক্তিগত যোগাযোগ ও পোস্টিং (Contact & Location)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="ইমেইল">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="name@vencon.com.bd"
                />
              </Field>

              <Field label="মোবাইল নম্বর">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+৮৮০ ১৭০০-০০০০০০"
                />
              </Field>

              <Field label="রক্তের গ্রুপ">
                <select
                  value={form.blood_group}
                  onChange={(e) => update("blood_group", e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="কর্মস্থল / পোস্টিং">
                <Input
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="ঢাকা হেড অফিস"
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Scannable QR Code & Summary Preview */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          <Card className="p-5 space-y-4 border-2 border-primary/20 bg-gradient-to-b from-primary/5 to-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <h4 className="font-bold text-foreground text-sm">লাইভ QR কোড প্রিভিউ</h4>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                রিয়েল-টাইম
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              এমপ্লয়ী আইডি ও তথ্য পরিবর্তনের সাথে সাথে এই ইউনিক QR কোড স্বয়ংক্রিয়ভাবে তৈরি হবে। যেকোনো ফোন দিয়ে স্ক্যান করলে ওয়েবসাইটে তার অফিশিয়াল ভেরিফিকেশন প্রোফাইল ওপেন হবে।
            </p>

            <EmployeeQrCode
              member={previewMember}
              size={180}
              showCard={false}
              showActions={true}
            />

            <div className="pt-2 border-t border-border/60 text-center space-y-1">
              <div className="text-[11px] text-muted-foreground">
                ভেরিফিকেশন URL:
              </div>
              <div className="text-xs font-mono font-bold text-foreground truncate">
                /team/{form.employee_id || form.slug || "id"}
              </div>
              <div className="text-[11px] font-medium text-emerald-600">
                কোম্পানি: {form.company_name || "Vencon"}
              </div>
            </div>
          </Card>

          {/* Form Submit Button */}
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={saving} className="w-full py-3 text-sm font-bold shadow-md">
              {saving ? "সংরক্ষণ হচ্ছে..." : "এমপ্লয়ী তথ্য সেভ করুন"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
