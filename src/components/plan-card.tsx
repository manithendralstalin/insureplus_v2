"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCurrency } from "@/lib/utils";
import type { Plan } from "@/lib/types";

export function PlanCard({
  plan,
  index = 0,
  compareChecked,
  onToggleCompare,
}: {
  plan: Plan;
  index?: number;
  compareChecked?: boolean;
  onToggleCompare?: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -6 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl glass gradient-border p-6"
    >
      {plan.popular && (
        <div className="absolute right-4 top-4">
          <Badge className="border-amber-400/40 bg-amber-400/15 text-amber-300">
            <Star className="h-3 w-3 fill-amber-300" /> Popular
          </Badge>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/20 ring-1 ring-white/10">
          <CategoryIcon category={plan.category} className="h-6 w-6 text-primary" />
        </span>
        <div>
          <Badge className="border-white/10 bg-white/5 text-muted-foreground">{plan.category}</Badge>
        </div>
      </div>

      <h3 className="text-xl font-bold tracking-tight">{plan.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{plan.tagline}</p>

      <div className="my-5 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div>
          <p className="text-xs text-muted-foreground">Coverage up to</p>
          <p className="text-lg font-bold text-white">{formatCurrency(plan.coverage)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Starting at</p>
          <p className="text-lg font-bold text-gradient">
            {formatCurrency(plan.premium)}
            <span className="text-xs font-medium text-muted-foreground">/mo</span>
          </p>
        </div>
      </div>

      <ul className="mb-6 space-y-2">
        {plan.benefits.slice(0, 3).map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-foreground/90">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3">
        <div className="flex gap-3">
          <Link href={`/buy/${plan.id}`} className="flex-1">
            <Button className="w-full">Buy Now</Button>
          </Link>
          <Link href={`/policy/${plan.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </Link>
        </div>

        {onToggleCompare && (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={!!compareChecked}
              onChange={() => onToggleCompare(plan.id)}
              className="h-4 w-4 rounded border-white/20 bg-transparent accent-[hsl(214_100%_56%)]"
            />
            Add to compare
          </label>
        )}
      </div>
    </motion.div>
  );
}
