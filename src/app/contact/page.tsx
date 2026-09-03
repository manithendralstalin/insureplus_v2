import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, MessageSquare, Headset } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the InsurePlus team — 24×7 support by phone, email and chat.",
};

const CONTACTS = [
  { icon: Phone, title: "Call us", value: "1800-123-4567", sub: "Toll-free, 24×7" },
  { icon: Mail, title: "Email us", value: "care@insureplus.com", sub: "Replies within 24 hrs" },
  { icon: MapPin, title: "Visit us", value: "One Financial Center", sub: "Mumbai 400051, India" },
  { icon: Clock, title: "Working hours", value: "Always open", sub: "Support never sleeps" },
];

export default function ContactPage() {
  return (
    <Section className="pt-12 md:pt-16">
      <SectionHeading
        eyebrow="Contact Us"
        title="We're here to help"
        subtitle="Questions about a plan, a claim or your policy? Reach out and a specialist will respond quickly."
      />

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {CONTACTS.map((c, i) => (
            <Reveal key={c.title} delayIndex={i}>
              <div className="flex items-start gap-4 rounded-2xl glass p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/20 ring-1 ring-white/10">
                  <c.icon className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{c.title}</p>
                  <p className="text-base font-semibold text-white">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.sub}</p>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delayIndex={4}>
            <div className="rounded-2xl glass p-5">
              <div className="flex items-center gap-3">
                <Headset className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">Dedicated relationship managers</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Every policyholder gets a named specialist. Find yours in the Customer Dashboard.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
                <MessageSquare className="h-4 w-4" /> Live chat available now
              </div>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
