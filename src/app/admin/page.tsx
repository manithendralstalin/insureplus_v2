import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/layout/section";
import { AdminClient } from "@/components/admin/admin-client";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage customer accounts.",
};

export default function AdminPage() {
  return (
    <Section className="pt-12 md:pt-16">
      <SectionHeading
        eyebrow="Admin"
        title="Customer accounts"
        subtitle="View, edit and remove customer accounts."
        center={false}
      />
      <AdminClient />
    </Section>
  );
}
