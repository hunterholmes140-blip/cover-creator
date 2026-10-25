import { useState, useId } from "react";
import { makeSlug } from "@/lib/admin-store";
import { Field, Input, Textarea, Button, Card } from "@/components/admin/ui";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TEAM_DEPARTMENTS, TeamDepartment, TeamMember, getDepartmentMeta } from "@/lib/team-types";
import { EmployeeQrCode } from "@/components/site/EmployeeQrCode";
import { QrCode, Sparkles, User, Briefcase, Mail, Phone, Calendar, Heart, MapPin } from "lucide-react";

export type TeamFormValue = {
  employee_id: string;
  name: string;
  slug: string;
  department: TeamDepartment;
  designation: string;
  avatar_url: string;
  email: string;
  phone: string;
  bio: string;
  joining_date: string;
  blood_group: string;
  location: string;
  status: "active" | "inactive";
  social: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
};

export const emptyTeamMember: TeamFormValue = {
  employee_id: "",
  name: "",
  slug: "",
  department: "Management",
  designation: "",
  avatar_url: "",
  email: "",
  phone: "",
  bio: "",
  joining_date: "",
  blood_group: "B+",
  location: "ঢাকা, বাংলাদেশ",
  status: "active",
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
  const [form, setForm] = useState<TeamFormValue>(initial);
  const deptMeta = getDepartmentMeta(form.department);

  const update = <K extends keyof TeamFormValue>(key: K, val: TeamFormValue[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      // Auto-generate slug if name changed and slug was default/empty
      if (key === "name" && (!prev.slug || prev.slug === makeSlug(prev.name))) {
        next.slug = makeSlug(val as string);
      }
      return next;
    });
  };

  const updateSocial = (key: string, val: string) => {
    setForm((prev) => ({
      ...prev,
      social: { ...prev.social, [key]: val },
    }));
  };

  // Auto-generate Employee ID helper if empty
  const autoSuggestId = () => {
    const prefix = form.department.substring(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    update("employee_id", `${prefix}-${rand}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("দয়া করে এমপ্লয়ীর নাম লিখুন");
    if (!form.employee_id.trim()) return alert("দয়া করে এমপ্লয়ী আইডি লিখুন");
    onSave(form);
  };

  // Preview object for the live QR Code
  const previewMember = {
    id: form.employee_id || "preview",
    employee_id: form.employee_id || "EMP-TEMP",
    slug: form.slug || makeSlug(form.name) || "employee",
    name: form.name || "এমপ্লয়ীর নাম",
    department: form.department,
    designation: form.designation || "পদবী",
    avatar_url: form.avatar_url,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Info Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <User className="h-4 w-4 text-primary" />
              মূল তথ্য ও পদবী নির্ধারণ
            </h3>

            {/* Employee ID & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Employee ID Input */}
              <Field
                label="এমপ্লয়ী আইডি (Employee ID) *"
                hint="ইউনিক আইডি যা কার্ড এবং QR কোডে ব্যবহৃত হবে"
              >
                <div className="flex gap-2">
                  <Input
                    required
                    value={form.employee_id}
                    onChange={(e) => update("employee_id", e.target.value.trim().toUpperCase())}
                    placeholder="যেমন: EMP-101, MGT-01"
                    className="font-mono font-bold"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={autoSuggestId}
                    className="whitespace-nowrap text-xs"
                    title="স্বয়ংক্রিয় আইডি তৈরি করুন"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    অটো
                  </Button>
                </div>
              </Field>

              {/* Department Dropdown */}
              <Field
                label="ডিপার্টমেন্ট / বিভাগ (পদ নির্ধারণ) *"
                hint="এডমিন থেকে ঠিক করুন কে কোন পদের"
              >
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
            </div>

            {/* Name and Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="পূর্ণ নাম *" hint="কর্মকর্তার পূর্ণ নাম">
                <Input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="যেমন: ফারাজুল ইসলাম"
                />
              </Field>

              <Field label="সুনির্দিষ্ট পদবী (Designation) *" hint="যেমন: Managing Director, Senior Author">
                <Input
                  required
                  value={form.designation}
                  onChange={(e) => update("designation", e.target.value)}
                  placeholder="যেমন: হেড অব সেলস / লিড অথর"
                />
              </Field>
            </div>

            {/* Photo / Avatar Upload */}
            <Field label="প্রোফাইল ছবি (Photo)" hint="কর্মীর পাসপোর্ট সাইজ বা অফিশিয়াল ছবি আপলোড করুন">
              <ImageUpload
                value={form.avatar_url}
                onChange={(url) => update("avatar_url", url)}
                aspect="square"
                previewClassName="h-28 w-28 rounded-full"
              />
            </Field>

            {/* Bio */}
            <Field label="পরিচিতি ও দায়িত্ব (Bio)" hint="কর্মীর অভিজ্ঞতা ও দায়িত্ব সম্পর্কে বিস্তারিত">
              <Textarea
                rows={3}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="এখানে কর্মীর অভিজ্ঞতা, দায়িত্ব বা ভূমিকা লিখুন..."
              />
            </Field>
          </Card>

          {/* Contact and Particulars Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Briefcase className="h-4 w-4 text-primary" />
              যোগাযোগ ও অফিশিয়াল বিবরণ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="অফিশিয়াল ইমেইল" hint="কর্মীর অফিশিয়াল যোগাযোগ ইমেইল">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="name@nextscale.com"
                />
              </Field>

              <Field label="মোবাইল নম্বর" hint="কর্মীর ফোন নম্বর">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+৮৮০ ১৭০০-০০০০০০"
                />
              </Field>

              <Field label="যোগদানের তারিখ">
                <Input
                  value={form.joining_date}
                  onChange={(e) => update("joining_date", e.target.value)}
                  placeholder="যেমন: ১৫ জানুয়ারি, ২০২৪"
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

              <Field label="ইউআরএল স্লাগ (Slug)">
                <Input
                  value={form.slug}
                  onChange={(e) => update("slug", makeSlug(e.target.value))}
                  placeholder="farazul-islam"
                />
              </Field>
            </div>
          </Card>

          {/* Social Links Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
              সামাজিক মাধ্যম ও ওয়েবসাইট
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Facebook লিঙ্ক">
                <Input
                  value={form.social?.facebook || ""}
                  onChange={(e) => updateSocial("facebook", e.target.value)}
                  placeholder="https://facebook.com/username"
                />
              </Field>
              <Field label="LinkedIn লিঙ্ক">
                <Input
                  value={form.social?.linkedin || ""}
                  onChange={(e) => updateSocial("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </Field>
              <Field label="Twitter লিঙ্ক">
                <Input
                  value={form.social?.twitter || ""}
                  onChange={(e) => updateSocial("twitter", e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </Field>
              <Field label="GitHub লিঙ্ক">
                <Input
                  value={form.social?.github || ""}
                  onChange={(e) => updateSocial("github", e.target.value)}
                  placeholder="https://github.com/username"
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
              এমপ্লয়ী আইডি ও তথ্য পরিবর্তনের সাথে সাথে এই ইউনিক QR কোড স্বয়ংক্রিয়ভাবে তৈরি হবে। যেকোনো ফোন দিয়ে স্ক্যান করলে ওয়েবসাইটে তার প্রোফাইল ওপেন হবে।
            </p>

            <EmployeeQrCode
              member={previewMember}
              size={180}
              showCard={false}
              showActions={true}
            />

            <div className="pt-2 border-t border-border/60 text-center">
              <div className="text-[11px] text-muted-foreground">
                স্ক্যান করলে যাবে:
              </div>
              <div className="text-xs font-mono font-bold text-foreground truncate mt-0.5">
                /team/{form.employee_id || form.slug || "id"}
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
