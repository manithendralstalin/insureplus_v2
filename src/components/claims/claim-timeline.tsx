"use client";

import { motion } from "framer-motion";
import { Check, Clock, FileText, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { classForStatus, formatCurrency, formatDate } from "@/lib/utils";
import type { Claim } from "@/lib/types";

const STEPS = ["Submitted", "Under Review", "Approved"] as const;

function stepIndex(status: string): number {
  const s = status.toLowerCase();
  if (s === "rejected") return 1; // stops at review, then rejected
  if (s === "approved") return 2;
  if (s === "under review") return 1;
  return 0;
}

export function ClaimTimeline({ claim }: { claim: Claim }) {
  const rejected = claim.status.toLowerCase() === "rejected";
  const activeIdx = stepIndex(claim.status);

  const steps = rejected
    ? [
        { label: "Submitted", icon: FileText },
        { label: "Under Review", icon: Clock },
        { label: "Rejected", icon: XCircle },
      ]
    : [
        { label: "Submitted", icon: FileText },
        { label: "Under Review", icon: Clock },
        { label: "Approved", icon: ShieldCheck },
      ];

  return (
    <div className="rounded-2xl glass p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Claim ID</p>
          <p className="text-lg font-bold text-white">{claim.claimId}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Policy {claim.policyId} · {claim.claimType}
          </p>
        </div>
        <Badge className={classForStatus(claim.status)}>{claim.status}</Badge>
      </div>

      <div className="my-6 grid grid-cols-2 gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:grid-cols-4">
        <Meta label="Claimant" value={claim.customerName} />
        <Meta label="Incident" value={formatDate(claim.incidentDate)} />
        <Meta label="Submitted" value={formatDate(claim.submittedDate)} />
        <Meta label="Amount" value={formatCurrency(claim.amount)} />
      </div>

      {/* Progress tracker */}
      <div className="relative mt-8">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-white/10" />
        <motion.div
          className={`absolute left-0 top-5 h-0.5 ${rejected ? "bg-rose-500" : "bg-gradient-to-r from-[hsl(214_100%_56%)] to-emerald-400"}`}
          initial={{ width: "0%" }}
          animate={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        <div className="relative flex justify-between">
          {steps.map((step, i) => {
            const done = i <= activeIdx;
            const isRejectStep = rejected && i === steps.length - 1 && activeIdx >= 1;
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isRejectStep
                      ? "border-rose-500 bg-rose-500 text-white"
                      : done
                      ? "border-emerald-400 bg-emerald-400 text-black"
                      : "border-white/20 bg-[hsl(222_40%_10%)] text-muted-foreground"
                  }`}
                >
                  {done && !isRejectStep ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </motion.span>
                <span className={`text-center text-xs font-medium ${done ? "text-white" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <p className="text-xs text-muted-foreground">Description</p>
        <p className="mt-1 text-sm text-foreground/90">{claim.description}</p>
        {claim.documentName && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary">
            <FileText className="h-3.5 w-3.5" /> {claim.documentName}
          </p>
        )}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
