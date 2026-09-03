import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/layout/section";
import { BuyWizard } from "@/components/buy/buy-wizard";
import { PLANS, getPlan } from "@/lib/plans";

export function generateStaticParams() {
  return PLANS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const plan = getPlan(id);
  return { title: plan ? `Buy ${plan.name}` : "Buy Policy" };
}

export default async function BuyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}) {
  const { id } = await params;
  const { term } = await searchParams;
  const plan = getPlan(id);
  if (!plan) notFound();

  const maxTerm = plan.category === "Life" ? 40 : 5;
  const parsed = Number(term);
  const initialTerm = Number.isFinite(parsed) ? Math.min(Math.max(Math.round(parsed), 1), maxTerm) : 1;

  return (
    <Section className="pt-8 md:pt-12">
      <Link
        href={`/policy/${plan.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to plan details
      </Link>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Buy Your Policy</h1>
        <p className="mt-3 text-muted-foreground">Complete these steps to activate your cover in minutes.</p>
      </div>
      <BuyWizard plan={plan} initialTerm={initialTerm} />
    </Section>
  );
}
