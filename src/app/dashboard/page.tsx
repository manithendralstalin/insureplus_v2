import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/layout/section";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Customer Dashboard",
  description: "Manage your policies, payments, claims and documents in one secure place.",
};

export default function DashboardPage() {
  return (
    <Section className="pt-12 md:pt-16">
      <SectionHeading
        eyebrow="Customer Dashboard"
        title="Your insurance, at a glance"
        subtitle="Track policies, payments, claims, documents and renewals — all in one secure dashboard."
      />
      <DashboardClient />
    </Section>
  );
}
