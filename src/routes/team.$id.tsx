import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Briefcase,
  Share2,
  ExternalLink,
  Facebook,
  Linkedin,
  Twitter,
  Github,
  Globe,
  CreditCard,
  Clock,
  Building,
  CheckCircle2,
  Info,
} from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useTeam } from "@/lib/admin-store";
import {
  getDepartmentMeta,
  TeamMember,
  formatRemainingValidity,
  getEffectiveVerificationStatus,
  DEFAULT_VISIBILITY,
} from "@/lib/team-types";
import { EmployeeQrCode } from "@/components/site/EmployeeQrCode";

export const Route = createFileRoute("/team/$id")({
  head: () => ({
    meta: [
      { title: "কর্মকর্তা ভেরিফিকেশন প্রোফাইল — Vencon" },
      { name: "description", content: "Vencon অফিসিয়াল কর্মী পরিচয়পত্র ও যাচাইকরণ।" },
    ],
  }),
  component: TeamMemberProfilePage,
});

function TeamMemberProfilePage() {
  const { id } = useParams({ from: "/team/$id" });
  const { items } = useTeam();

  const member = useMemo(() => {
    if (!items || !id) return null;
    const target = decodeURIComponent(id).trim().toLowerCase();
    return items.find((m: TeamMember) => {
      const empId = (m.employee_id || "").trim().toLowerCase();
      const slug = (m.slug || "").trim().toLowerCase();
      const mid = String(m.id || "").trim().toLowerCase();
      return empId === target || slug === target || mid === target;
    });
  }, [items, id]);

  if (!member) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive grid place-items-center mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">টিম মেম্বার পাওয়া যায়নি</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            আপনি যে এমপ্লয়ী আইডি বা ভেরিফিকেশন প্রোফাইল খুঁজছেন তা খুঁজে পাওয়া যায়নি অথবা মুছে ফেলা হয়েছে।
          </p>
          <Link
            to="/team"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            টিম ডিরেক্টরিতে ফিরে যান
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const deptMeta = getDepartmentMeta(member.department);
  const visibility = { ...DEFAULT_VISIBILITY, ...(member.visibility || {}) };
  const effectiveStatus = getEffectiveVerificationStatus(member);
  const remainingValidity = formatRemainingValidity(member.id_card_expiry_date);
  const companyName = member.company_name || "Vencon";

  return (
    <SiteLayout>
      <div className="min-h-screen bg-muted/20 pb-24">
        {/* Top Navigation Bar */}
        <div className="border-b border-border bg-background/80 backdrop-blur sticky top-16 z-30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
            <Link
              to="/team"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>টিম ডিরেক্টরিতে ফিরে যান</span>
            </Link>

            <div className="flex items-center gap-2 text-xs">
              <span className="hidden sm:inline font-medium text-muted-foreground">{companyName} •</span>
              <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${deptMeta.badgeColor}`}>
                {member.department}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold border ${effectiveStatus.badgeColor}`}>
                {effectiveStatus.status}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Container */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Official Digital ID Card with QR Code */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border-2 border-border bg-card shadow-2xl overflow-hidden relative">
                {/* Header ribbon */}
                <div className={`h-28 bg-gradient-to-r ${deptMeta.gradient} p-5 flex items-start justify-between text-white relative`}>
                  <div className="space-y-0.5">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                      <Building className="h-3 w-3" />
                      {companyName}
                    </div>
                    <div className="text-sm sm:text-base font-extrabold tracking-tight mt-1">
                      OFFICIAL EMPLOYEE ID
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-foreground shadow-sm">
                      {effectiveStatus.status === "Valid" ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                      )}
                      <span>{effectiveStatus.status}</span>
                    </div>
                  </div>
                </div>

                {/* Avatar with overlap */}
                <div className="px-6 -mt-12 text-center flex flex-col items-center">
                  <div className="relative">
                    <div className="h-28 w-28 rounded-full overflow-hidden ring-4 ring-card shadow-xl bg-muted">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-3xl font-extrabold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute bottom-1 right-1 h-7 w-7 rounded-full text-white grid place-items-center ring-2 ring-card shadow ${
                        effectiveStatus.status === "Valid" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      title={effectiveStatus.labelBn}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>

                  <h1
                    className="text-2xl font-extrabold text-foreground mt-3"
                    style={{ fontFamily: '"Hind Siliguri", var(--font-sans)' }}
                  >
                    {member.name}
                  </h1>

                  <p className="text-sm font-semibold text-primary mt-0.5">
                    {member.designation}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                    {member.employee_id && (
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
                        ID: {member.employee_id}
                      </span>
                    )}

                    {visibility.employment_type && member.employment_type && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {member.employment_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Integrated Scannable QR Code */}
                <div className="p-6 pt-4 border-t border-border mt-4 bg-muted/20">
                  <EmployeeQrCode member={member} size={170} showCard={false} showActions={true} />
                </div>
              </div>
            </div>

            {/* Right Column: Full Particulars, Bio & Official Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Verification Header Banner */}
              <div className={`rounded-2xl border p-5 flex items-start gap-4 ${
                effectiveStatus.status === "Valid"
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-950 dark:text-emerald-100"
                  : "border-amber-500/20 bg-amber-500/5 text-amber-950 dark:text-amber-100"
              }`}>
                <div className={`h-11 w-11 rounded-xl flex-shrink-0 grid place-items-center ${
                  effectiveStatus.status === "Valid"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}>
                  {effectiveStatus.status === "Valid" ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : (
                    <ShieldAlert className="h-6 w-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">
                    {companyName} ভেরিফায়েড অফিশিয়াল কর্মী প্রোফাইল ({effectiveStatus.labelBn})
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    এই কর্মকর্তা/কর্মচারী <strong>{companyName}</strong>-এর একজন অনুমোদিত সদস্য। কিউআর কোড স্ক্যান করে তার ডিজিটাল পরিচয়পত্র, পদবি ও মেয়াদ যাচাই করা সম্ভব।
                  </p>
                </div>
              </div>

              {/* Bio Section (if visible) */}
              {visibility.bio && member.bio && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-2">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    পরিচিতি ও দায়িত্ব (Bio & Roles)
                  </h3>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                    {member.bio}
                  </p>
                </div>
              )}

              {/* Official Particulars Grid */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    অফিশিয়াল পরিচয়পত্র ও সার্ভিসের বিবরণ
                  </h3>
                  {member.last_updated && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      আপডেট: {member.last_updated}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {/* Company Name */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center flex-shrink-0">
                      <Building className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium">প্রতিষ্ঠান (Company)</div>
                      <div className="font-bold text-foreground">{companyName}</div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 grid place-items-center flex-shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium">বিভাগ (Department)</div>
                      <div className="font-semibold text-foreground">{member.department}</div>
                    </div>
                  </div>

                  {/* Employee ID */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center flex-shrink-0 font-mono font-bold text-xs">
                      ID
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground font-medium">ইউনিক আইডি (Employee ID)</div>
                      <div className="font-mono font-bold text-foreground">{member.employee_id}</div>
                    </div>
                  </div>

                  {/* ID Card Number (if visible) */}
                  {visibility.id_card_number && member.id_card_number && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 grid place-items-center flex-shrink-0">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">পরিচয়পত্র নম্বর (ID Card No.)</div>
                        <div className="font-mono font-bold text-foreground">{member.id_card_number}</div>
                      </div>
                    </div>
                  )}

                  {/* Employment Type (if visible) */}
                  {visibility.employment_type && member.employment_type && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 grid place-items-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">চাকরির ধরণ (Employment Type)</div>
                        <div className="font-semibold text-foreground">{member.employment_type}</div>
                      </div>
                    </div>
                  )}

                  {/* Employment Status (if visible) */}
                  {visibility.employment_status && member.employment_status && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-cyan-500/10 text-cyan-600 grid place-items-center flex-shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">চাকরির অবস্থা (Employment Status)</div>
                        <div className="font-semibold text-foreground">{member.employment_status}</div>
                      </div>
                    </div>
                  )}

                  {/* Joining Date (if visible) */}
                  {visibility.joining_date && member.joining_date && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 grid place-items-center flex-shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">যোগদানের তারিখ (Joining Date)</div>
                        <div className="font-semibold text-foreground">{member.joining_date}</div>
                      </div>
                    </div>
                  )}

                  {/* ID Card Dates: Issue & Expiry (if visible) */}
                  {visibility.id_card_dates && (member.id_card_issue_date || member.id_card_expiry_date) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 grid place-items-center flex-shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">ইস্যু ও মেয়াদ শেষ (Dates)</div>
                        <div className="font-semibold text-foreground text-xs">
                          {member.id_card_issue_date || "N/A"} হতে {member.id_card_expiry_date || "N/A"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remaining Validity (if visible) */}
                  {visibility.remaining_validity && member.id_card_expiry_date && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 sm:col-span-2">
                      <div className={`h-9 w-9 rounded-lg grid place-items-center flex-shrink-0 ${
                        remainingValidity.isExpired ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] text-muted-foreground font-medium">আর কত দিন বৈধ আছে (Remaining Validity)</div>
                        <div className={`font-bold ${
                          remainingValidity.isExpired ? "text-rose-600" : "text-emerald-600"
                        }`}>
                          {remainingValidity.text}
                          {member.validation_period && (
                            <span className="text-muted-foreground font-normal text-xs ml-2">
                              (মোট মেয়াদ: {member.validation_period})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Blood Group (if visible) */}
                  {visibility.blood_group && member.blood_group && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 grid place-items-center flex-shrink-0">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">রক্তের গ্রুপ (Blood Group)</div>
                        <div className="font-bold text-rose-600">{member.blood_group}</div>
                      </div>
                    </div>
                  )}

                  {/* Location (if visible) */}
                  {visibility.location && member.location && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 grid place-items-center flex-shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">কর্মস্থল / অফিস (Location)</div>
                        <div className="font-semibold text-foreground">{member.location}</div>
                      </div>
                    </div>
                  )}

                  {/* Email (if visible) */}
                  {visibility.email && member.email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 grid place-items-center flex-shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[11px] text-muted-foreground font-medium">অফিশিয়াল ইমেইল</div>
                        <a
                          href={`mailto:${member.email}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
                        >
                          {member.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Phone (if visible) */}
                  {visibility.phone && member.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 grid place-items-center flex-shrink-0">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium">যোগাযোগ নম্বর</div>
                        <a
                          href={`tel:${member.phone}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Official Verification Contact Notice (if visible) */}
              {visibility.official_contact && member.official_contact && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-foreground">
                      অফিশিয়াল ভেরিফিকেশন যোগাযোগ (Official Verification Contact)
                    </div>
                    <div className="text-muted-foreground leading-relaxed">
                      {member.official_contact}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links (if visible) */}
              {visibility.social && member.social && Object.values(member.social).some(Boolean) && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    সামাজিক মাধ্যম ও সংযোগ
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {member.social.facebook && (
                      <a
                        href={member.social.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                      >
                        <Facebook className="h-4 w-4" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {member.social.linkedin && (
                      <a
                        href={member.social.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {member.social.twitter && (
                      <a
                        href={member.social.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                        <span>Twitter / X</span>
                      </a>
                    )}
                    {member.social.github && (
                      <a
                        href={member.social.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/10 text-slate-800 dark:text-slate-200 hover:bg-slate-800/20 transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {member.social.website && (
                      <a
                        href={member.social.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
