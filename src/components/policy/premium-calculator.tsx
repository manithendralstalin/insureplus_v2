"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { computeQuote } from "@/lib/pricing";
import type { Plan } from "@/lib/types";

export function PremiumCalculator({ plan }: { plan: Plan }) {
  const [term, setTerm] = React.useState(1);
  const [coverageIdx, setCoverageIdx] = React.useState(1); // 0.5,1,1.5,2

  const multipliers = [0.5, 1, 1.5, 2];
  const multiplier = multipliers[coverageIdx];
  const quote = computeQuote(plan, term, multiplier);
  const coverageAmount = Math.round(plan.coverage * multiplier);

  return (
    <div className="rounded-2xl glass p-6">
      <h3 className="text-lg font-bold">Premium Calculator</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Estimate your premium instantly. Adjust the term and coverage.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Policy term</span>
            <span className="font-semibold text-white">{term} {term === 1 ? "year" : "years"}</span>
          </div>
          <input
            type="range"
            min={1}
            max={plan.category === "Life" ? 40 : 5}
            step={1}
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="w-full accent-[hsl(214_100%_56%)]"
            aria-label="Policy term in years"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Coverage amount</p>
          <div className="grid grid-cols-4 gap-2">
            {multipliers.map((m, i) => (
              <button
                key={m}
                type="button"
                onClick={() => setCoverageIdx(i)}
                className={`rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
                  coverageIdx === i
                    ? "bg-gradient-to-r from-[hsl(214_100%_56%)] to-[hsl(199_89%_55%)] text-white"
                    : "glass text-muted-foreground hover:text-white"
                }`}
              >
                {m}×
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Sum insured: <span className="font-semibold text-white">{formatCurrency(coverageAmount)}</span>
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm">
          <Line label="Premium / month" value={formatCurrency(quote.monthly)} />
          <Line label={`Base (${term} yr)`} value={formatCurrency(quote.base)} />
          <Line label="GST (18%)" value={formatCurrency(quote.gst)} />
          <div className="mt-2 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total payable</span>
              <motion.span
                key={quote.total}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-extrabold text-gradient"
              >
                {formatCurrency(quote.total)}
              </motion.span>
            </div>
          </div>
        </div>

        <Link href={`/buy/${plan.id}?term=${term}`} className="block">
          <Button className="w-full" size="lg">Buy This Policy</Button>
        </Link>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
