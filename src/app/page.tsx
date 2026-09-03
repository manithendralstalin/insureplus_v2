import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  HeadphonesIcon,
  Wallet,
  Lock,
  Award,
  ArrowRight,
  Quote,
} from "lucide-react";
import { Hero } from "@/components/home/hero";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/ui/reveal";
import { Accordion } from "@/components/ui/accordion";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/ui/category-icon";
import { PLANS, CATEGORIES } from "@/lib/plans";

const WHY = [
  { icon: Zap, title: "Instant Digital Policies", desc: "Buy and receive your policy in minutes — no paperwork, no waiting." },
  { icon: ShieldCheck, title: "99.2% Claim Settlement", desc: "Among the highest in the industry, with cashless claims in hours." },
  { icon: HeadphonesIcon, title: "24×7 Human Support", desc: "Real specialists on call, chat and email — whenever you need us." },
  { icon: Wallet, title: "Transparent Pricing", desc: "No hidden charges. See exactly what you pay with our live calculator." },
  { icon: Lock, title: "Bank-Grade Security", desc: "256-bit encryption and PCI-aware payment handling on every transaction." },
  { icon: Award, title: "Award-Winning Service", desc: "Rated 4.9/5 by over 200,000 verified customers across India." },
];

const TESTIMONIALS = [
  { name: "Ananya Reddy", role: "Health Shield Elite", text: "My hospital claim was approved in under 4 hours. The dashboard kept me updated at every step. Genuinely the smoothest insurance experience I've had.", initials: "AR" },
  { name: "Rohan Gupta", role: "Motor Secure", text: "Comparing plans was effortless and buying took five minutes. When I had an accident, roadside assistance arrived fast. Worth every rupee.", initials: "RG" },
  { name: "Meera Iyer", role: "Life Secure Term", text: "Transparent pricing and no pushy agents. The premium calculator showed me exactly what I'd pay. Highly recommend for anyone protecting their family.", initials: "MI" },
];

const PARTNERS = ["Apollo", "Fortis", "Max Health", "Manipal", "Medanta", "Narayana"];

const FAQS = [
  { q: "How quickly is my policy issued after payment?", a: "Instantly. As soon as your dummy payment succeeds, we generate your policy number (e.g. POL-2026-00001), a payment reference and a downloadable receipt — all visible in your dashboard." },
  { q: "How does the claims process work?", a: "Submit a claim from the Claims Portal with your policy number and incident details. You can then track its status — Submitted, Under Review, Approved or Rejected — on a live timeline." },
  { q: "Is my payment information stored securely?", a: "We never store your full card number or CVV. Only the last 4 digits and a payment reference are retained, in line with PCI-aware practices." },
  { q: "Can I compare multiple plans before buying?", a: "Yes. On the Insurance Plans page you can filter by category, coverage, premium and duration, then add plans to a side-by-side comparison." },
  { q: "What documents do I need to buy a policy?", a: "It varies by product, but typically ID proof, address proof and a photograph. Each plan's detail page lists the exact documents required." },
];

export default function HomePage() {
  const popular = PLANS.filter((p) => p.popular);

  return (
    <>
      <Hero />

      {/* Partner logos */}
      <Section className="py-12 md:py-14">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Cashless at India&apos;s leading hospital networks
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {PARTNERS.map((p, i) => (
            <Reveal key={p} delayIndex={i}>
              <div className="flex h-16 items-center justify-center rounded-xl glass text-sm font-bold tracking-wide text-muted-foreground transition-colors hover:text-white">
                {p}
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Why choose us */}
      <Section>
        <SectionHeading
          eyebrow="Why InsurePlus"
          title="Insurance, reimagined for the modern era"
          subtitle="Everything you expect from a premium financial institution — powered by technology that puts you first."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((f, i) => (
            <Reveal key={f.title} delayIndex={i}>
              <div className="group h-full rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06]">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/20 ring-1 ring-white/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Categories */}
      <Section className="py-16">
        <SectionHeading
          eyebrow="Coverage for every need"
          title="Explore our insurance categories"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.key} delayIndex={i}>
              <Link href={`/plans?category=${c.key}`} className="block h-full">
                <div className="group h-full rounded-2xl glass p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.06]">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 ring-1 ring-white/10 transition-transform group-hover:scale-110">
                    <CategoryIcon category={c.key} className="h-7 w-7 text-primary" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{c.label}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.blurb}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Popular plans */}
      <Section>
        <SectionHeading
          eyebrow="Most popular"
          title="Plans our customers love"
          subtitle="Hand-picked, best-value plans across categories. Compare the full catalogue anytime."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {popular.map((p, i) => (
            <PlanCard key={p.id} plan={p} index={i} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/plans">
            <Button size="lg" variant="secondary">
              View all plans <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Section>

      {/* Testimonials */}
      <Section>
        <SectionHeading
          eyebrow="Loved by families"
          title="What our customers say"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delayIndex={i}>
              <figure className="flex h-full flex-col rounded-2xl glass p-6">
                <Quote className="h-8 w-8 text-primary/60" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <SectionHeading eyebrow="Good to know" title="Frequently asked questions" />
        <div className="mx-auto max-w-3xl">
          <Accordion items={FAQS} />
        </div>
      </Section>

      {/* CTA */}
      <Section className="pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl glass-strong px-6 py-14 text-center md:px-12 md:py-20">
            <div
              className="pointer-events-none absolute inset-0 -z-10 opacity-60"
              style={{
                background:
                  "radial-gradient(50% 60% at 50% 0%, hsl(214 100% 50% / 0.35), transparent 70%)",
              }}
            />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to protect what matters most?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Get a personalised quote in under two minutes. No spam, no obligation.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/plans">
                <Button size="lg">
                  Get Your Quote <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Talk to an Expert
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
