import { Suspense } from "react";
import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/layout/section";
import { PlansExplorer } from "@/components/plans/plans-explorer";

export const metadata: Metadata = {
  title: "Insurance Plans",
  description: "Compare and buy health, life, motor, travel and home insurance plans.",
};

export default function PlansPage() {
  return (
    <Section className="pt-12 md:pt-16">
      <SectionHeading
        eyebrow="Insurance Plans"
        title="Find the right cover for you"
        subtitle="Filter by category, coverage, premium and duration. Search, compare and buy in minutes."
      />
      <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading plans…</div>}>
        <PlansExplorer />
      </Suspense>
    </Section>
  );
}
