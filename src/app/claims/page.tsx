import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/layout/section";
import { ClaimsPortal } from "@/components/claims/claims-portal";

export const metadata: Metadata = {
  title: "Claims Portal",
  description: "Submit and track insurance claims with a live status timeline.",
};

export default function ClaimsPage() {
  return (
    <Section className="pt-12 md:pt-16">
      <SectionHeading
        eyebrow="Claims Portal"
        title="File & track your claim"
        subtitle="Submit a new claim in minutes, then follow its progress on a live timeline — Submitted, Under Review, Approved or Rejected."
      />
      <ClaimsPortal />
    </Section>
  );
}
