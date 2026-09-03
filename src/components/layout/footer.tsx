import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

const columns = [
  {
    title: "Products",
    links: [
      { label: "Health Insurance", href: "/plans?category=Health" },
      { label: "Life Insurance", href: "/plans?category=Life" },
      { label: "Motor Insurance", href: "/plans?category=Motor" },
      { label: "Travel Insurance", href: "/plans?category=Travel" },
      { label: "Home Insurance", href: "/plans?category=Home" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/contact" },
      { label: "Customer Dashboard", href: "/dashboard" },
      { label: "Claims Portal", href: "/claims" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "File a Claim", href: "/claims" },
      { label: "Track a Claim", href: "/claims" },
      { label: "Compare Plans", href: "/plans" },
      { label: "Get a Quote", href: "/plans" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-[hsl(222_44%_6%)]/60">
      <div className="container-1440 grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(214_100%_56%)] to-[hsl(199_89%_55%)]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Insure<span className="text-gradient">Plus</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Enterprise-grade insurance for what matters most. Protecting over 2 million
            families with health, life, motor, travel and home cover — backed by a 99%
            claim settlement ratio.
          </p>
          <div className="mt-5 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> 1800-123-4567 (Toll Free)</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> care@insureplus.com</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> One Financial Center, Mumbai 400051</p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold text-white">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-1440 flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 InsurePlus Financial Services. All rights reserved. IRDAI Reg. No. 000.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
            <span>Grievance Redressal</span>
            <Link href="/admin" className="transition-colors hover:text-white">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
