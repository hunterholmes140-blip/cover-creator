import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useContent } from "@/lib/content-store";
import { FOOTER_CONTENT_DEFAULTS, CONTENT_KEYS, type FooterContent } from "@/lib/content-defaults";
import { PageHeader, Card, Field, Input, Button, useToast } from "@/components/admin/ui";
import { Save, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/admin/footer")({
  component: FooterAdmin,
});

function FooterAdmin() {
  const [content, , setAll] = useContent(CONTENT_KEYS.FOOTER, FOOTER_CONTENT_DEFAULTS);
  const [form, setForm] = useState<FooterContent>(content);
  const toast = useToast();
  useEffect(() => setForm(content), [content]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="ফুটার কন্টেন্ট"
        subtitle="ফুটার কলাম হেডিং ও কপিরাইট টেক্সট।"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setAll(FOOTER_CONTENT_DEFAULTS); toast.show("ডিফল্টে ফিরানো হয়েছে"); }}>
              <RotateCcw className="h-4 w-4" /> ডিফল্ট
            </Button>
            <Button onClick={() => { setAll(form); toast.show("সেভ হয়েছে"); }}><Save className="h-4 w-4" /> সেভ</Button>
          </div>
        }
      />
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="কলাম ১ হেডিং"><Input value={form.companyHeading} onChange={(e) => setForm({ ...form, companyHeading: e.target.value })} /></Field>
          <Field label="কলাম ২ হেডিং"><Input value={form.contactHeading} onChange={(e) => setForm({ ...form, contactHeading: e.target.value })} /></Field>
          <Field label="কলাম ৩ হেডিং"><Input value={form.quickLinksHeading} onChange={(e) => setForm({ ...form, quickLinksHeading: e.target.value })} /></Field>
          <Field label='কপিরাইট (ব্যবহার: {year}, {brand})'>
            <Input value={form.copyright} onChange={(e) => setForm({ ...form, copyright: e.target.value })} />
          </Field>
          <Field label="ট্যাগলাইন (নিচের ডান দিক)"><Input value={form.madeInText} onChange={(e) => setForm({ ...form, madeInText: e.target.value })} /></Field>
        </div>
      </Card>
      {toast.node}
    </div>
  );
}
