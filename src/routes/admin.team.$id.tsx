import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useTeam } from "@/lib/admin-store";
import { TeamForm, TeamFormValue } from "@/lib/team-form";
import { PageHeader, useToast, Button } from "@/components/admin/ui";
import { ArrowLeft } from "lucide-react";
import { TeamDepartment } from "@/lib/team-types";

export const Route = createFileRoute("/admin/team/$id")({
  component: AdminEditTeamMember,
});

function AdminEditTeamMember() {
  const { id } = useParams({ from: "/admin/team/$id" });
  const { items, update, saveNow } = useTeam();
  const navigate = useNavigate();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const member = useMemo(() => {
    return items.find((m: any) => String(m.id) === String(id) || String(m.employee_id) === String(id));
  }, [items, id]);

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <h3 className="text-lg font-bold">এমপ্লয়ী পাওয়া যায়নি</h3>
        <Link to="/admin/team" as any>
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" /> লিস্টে ফিরে যান
          </Button>
        </Link>
      </div>
    );
  }

  const initialVal: TeamFormValue = {
    company_name: member.company_name || "Vencon",
    employee_id: member.employee_id || "",
    name: member.name || "",
    slug: member.slug || "",
    department: (member.department || "Management") as TeamDepartment,
    designation: member.designation || "",
    avatar_url: member.avatar_url || "",
    email: member.email || "",
    phone: member.phone || "",
    bio: member.bio || "",
    employment_type: member.employment_type || "Permanent",
    joining_date: member.joining_date || "",
    employment_status: member.employment_status || "Active",
    id_card_number: member.id_card_number || "",
    id_card_issue_date: member.id_card_issue_date || "",
    id_card_expiry_date: member.id_card_expiry_date || "",
    validation_period: member.validation_period || "৩ বছর (3 Years)",
    verification_status: member.verification_status || "Valid",
    last_updated: member.last_updated || new Date().toISOString().split("T")[0],
    official_contact: member.official_contact || "Vencon Official: info@vencon.com.bd | +880 1700-000000 | Dhaka",
    blood_group: member.blood_group || "B+",
    location: member.location || "ঢাকা",
    status: member.status || "active",
    visibility: member.visibility || {
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
    },
    social: member.social || {},
  };

  const handleSave = async (val: TeamFormValue) => {
    setSaving(true);
    try {
      update(member.id, val);
      await saveNow();
      toast.show("এমপ্লয়ী তথ্য সফলভাবে আপডেট হয়েছে");
      navigate({ to: "/admin/team" as any });
    } catch (err: any) {
      toast.show(err?.message || "আপডেটে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title={`এমপ্লয়ী সম্পাদনা: ${member.name}`}
        subtitle={`আইডি: ${member.employee_id || "N/A"} • বিভাগ: ${member.department}`}
        actions={
          <Link to="/admin/team" as any>
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4 mr-1" /> ফিরে যান
            </Button>
          </Link>
        }
      />

      <TeamForm initial={initialVal} onSave={handleSave} saving={saving} />
    </div>
  );
}
