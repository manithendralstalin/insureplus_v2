import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Check,
  FileText,
  ShieldCheck,
  ClipboardList,
  ScrollText,
  ArrowLeft,
} from "lucide-react";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { CategoryIcon } from "@/components/ui/category-icon";
import { PremiumCalculator } from "@/components/policy/premium-calculator";
import { DownloadBrochure } from "@/components/policy/download-brochure";
import { PLANS, getPlan } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";

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
  return { title: plan ? plan.name : "Policy Details" };
}

const FAQS = [
  { q: "When does my cover begin?", a: "Cover begins immediately once your payment succeeds and the policy is issued, subject to any waiting periods listed in the terms." },
  { q: "Can I cancel and get a refund?", a: "Yes — most plans have a free-look period during which you can cancel for a refund of premium, less applicable charges." },
  { q: "How do I make a claim on this plan?", a: "Visit the Claims Portal, enter your policy number and incident details, then track the claim status live on your dashboard." },
];

export default async function PolicyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = getPlan(id);
  if (!plan) notFound();

  const related = PLANS.filter((p) => p.category === plan.category && p.id !== plan.id).slice(0, 3);

  return (
    <Section className="pt-8 md:pt-12">
      <Link
        href="/plans"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all plans
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left / main column */}
        <div className="space-y-8 lg:col-span-2">
          <Reveal>
            <div className="rounded-2xl glass p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 ring-1 ring-white/10">
                  <CategoryIcon category={plan.category} className="h-7 w-7 text-primary" />
                </span>
                <div>
                  <Badge className="border-white/10 bg-white/5 text-muted-foreground">{plan.category} Insurance</Badge>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{plan.name}</h1>
                </div>
              </div>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{plan.tagline}</p>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {plan.features.map((f) => (
                  <div key={f.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="mt-1 text-lg font-bold text-white">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Coverage + benefits */}
          <Reveal>
            <div className="rounded-2xl glass p-6 md:p-8">
              <div className="mb-5 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Coverage & Benefits</h2>
              </div>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-5">
                  <p className="text-sm text-muted-foreground">Coverage up to</p>
                  <p className="mt-1 text-2xl font-extrabold text-white">{formatCurrency(plan.coverage)}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                  <p className="text-sm text-muted-foreground">Premium starting</p>
                  <p className="mt-1 text-2xl font-extrabold text-gradient">
                    {formatCurrency(plan.premium)}<span className="text-sm font-medium text-muted-foreground">/mo</span>
                  </p>
                </div>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Eligibility + Documents */}
          <div className="grid gap-8 sm:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl glass p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Eligibility</h3>
                </div>
                <ul className="space-y-2.5">
                  {plan.eligibility.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-sm text-foreground/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {e}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delayIndex={1}>
              <div className="h-full rounded-2xl glass p-6">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Documents Required</h3>
                </div>
                <ul className="space-y-2.5">
                  {plan.documentsRequired.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-foreground/90">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Terms */}
          <Reveal>
            <div className="rounded-2xl glass p-6 md:p-8">
              <div className="mb-4 flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Terms & Conditions</h2>
              </div>
              <ul className="space-y-3">
                {plan.terms.map((t, i) => (
                  <li key={t} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Coverage comparison with related */}
          {related.length > 0 && (
            <Reveal>
              <div className="rounded-2xl glass p-6 md:p-8">
                <h2 className="mb-5 text-xl font-bold">Coverage Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="p-3 font-medium">Plan</th>
                        <th className="p-3 font-medium">Coverage</th>
                        <th className="p-3 font-medium">Premium</th>
                        <th className="p-3 font-medium">Duration</th>
                        <th className="p-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <tr className="bg-primary/5">
                        <td className="p-3 font-semibold text-white">{plan.name} <Badge className="ml-1 border-primary/30 bg-primary/15 text-primary">This plan</Badge></td>
                        <td className="p-3">{formatCurrency(plan.coverage)}</td>
                        <td className="p-3">{formatCurrency(plan.premium)}/mo</td>
                        <td className="p-3">{plan.duration}</td>
                        <td className="p-3" />
                      </tr>
                      {related.map((r) => (
                        <tr key={r.id}>
                          <td className="p-3 font-medium">{r.name}</td>
                          <td className="p-3">{formatCurrency(r.coverage)}</td>
                          <td className="p-3">{formatCurrency(r.premium)}/mo</td>
                          <td className="p-3">{r.duration}</td>
                          <td className="p-3">
                            <Link href={`/policy/${r.id}`} className="text-primary hover:underline">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          )}

          {/* FAQ */}
          <Reveal>
            <div>
              <h2 className="mb-5 text-xl font-bold">Frequently asked questions</h2>
              <Accordion items={FAQS} />
            </div>
          </Reveal>
        </div>

        {/* Right / sticky column */}
        <div className="lg:col-span-1">
          <div className="space-y-4 lg:sticky lg:top-24">
            <PremiumCalculator plan={plan} />
            <DownloadBrochure plan={plan} />
          </div>
        </div>
      </div>
    </Section>
  );
}
