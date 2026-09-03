"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileCheck2, GitCompareArrows, ShieldPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";

const floatCards = [
  { title: "Claim Approved", sub: "₹1,85,000 · 4 hrs", dot: "#34d399", top: "12%", left: "4%", delay: 0 },
  { title: "Policy Active", sub: "Health Shield Elite", dot: "#38bdf8", top: "60%", left: "0%", delay: 0.4 },
  { title: "99.2% Settled", sub: "FY 2025-26", dot: "#60a5fa", top: "20%", right: "2%", delay: 0.2 },
  { title: "Premium Paid", sub: "Visa ••1111", dot: "#a78bfa", top: "68%", right: "4%", delay: 0.6 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 md:pt-20">
      <div className="container-1440">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            IRDAI Licensed · Trusted by 2M+ families
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Protect What <br className="hidden sm:block" />
            <span className="text-gradient">Matters Most</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Enterprise-grade health, life, motor, travel and home insurance — with instant
            quotes, fully digital policies and industry-leading claim settlement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link href="/plans">
              <Button size="lg">
                Get Quote <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/plans">
              <Button size="lg" variant="outline">
                <GitCompareArrows className="h-4 w-4" /> Compare Plans
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5"><ShieldPlus className="h-4 w-4 text-primary" /> Buy Policy in minutes</span>
            <span className="flex items-center gap-1.5"><FileCheck2 className="h-4 w-4 text-primary" /> Cashless claims</span>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          {floatCards.map((c, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute hidden rounded-2xl glass px-4 py-3 shadow-xl lg:block"
              style={{ top: c.top, left: c.left, right: c.right }}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.dot }} />
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground">{c.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="grid grid-cols-2 gap-4 rounded-3xl glass-strong p-6 sm:p-8 md:grid-cols-4">
            {[
              { to: 2, suffix: "M+", label: "Families Protected", dec: 0 },
              { to: 99.2, suffix: "%", label: "Claims Settled", dec: 1 },
              { to: 12, suffix: "K+", label: "Network Hospitals", dec: 0 },
              { to: 4.9, suffix: "/5", label: "Customer Rating", dec: 1 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-gradient sm:text-3xl md:text-4xl">
                  <Counter to={s.to} suffix={s.suffix} decimals={s.dec} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
