import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTeam } from "@/lib/admin-store";
import { TeamForm, TeamFormValue, emptyTeamMember } from "@/lib/team-form";
import { PageHeader, useToast } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/team/new")({
  component: AdminNewTeamMember,
});

function AdminNewTeamMember() {
  const { add, saveNow } = useTeam();
  const navigate = useNavigate();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async (val: TeamFormValue) => {
    setSaving(true);
    try {
      add({
        ...val,
        id: Date.now(),
      });
      await saveNow();
      toast.show("নতুন এমপ্লয়ী সফলভাবে যোগ করা হয়েছে");
      navigate({ to: "/admin/team" as any });
    } catch (err: any) {
      toast.show(err?.message || "সংরক্ষণে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="নতুন এমপ্লয়ী যোগ করুন"
        subtitle="কর্মকর্তা বা কর্মচারীর পদ, বিভাগ, আইডি এবং ছবি যুক্ত করুন। ইউনিক কিউআর কোড স্বয়ংক্রিয় তৈরি হবে।"
      />

      <TeamForm initial={emptyTeamMember} onSave={handleSave} saving={saving} />
    </div>
  );
}
