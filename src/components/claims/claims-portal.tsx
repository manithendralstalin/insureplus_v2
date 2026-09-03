"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Search, Upload, FilePlus2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { ClaimTimeline } from "@/components/claims/claim-timeline";
import { claimSchema, type ClaimInput } from "@/lib/schemas";
import type { Claim } from "@/lib/types";

const CLAIM_TYPES = ["Hospitalization", "Accident", "Theft", "Fire", "Natural Calamity", "Trip Cancellation", "Death", "Other"];

export function ClaimsPortal() {
  const [tab, setTab] = React.useState<"submit" | "track">("submit");

  return (
    <div>
      <div className="mx-auto mb-8 flex max-w-md rounded-full glass p-1">
        {(["submit", "track"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t ? "text-white" : "text-muted-foreground hover:text-white"
            }`}
          >
            {tab === t && (
              <motion.span
                layoutId="claims-tab"
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-[hsl(214_100%_56%)] to-[hsl(199_89%_55%)]"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            )}
            {t === "submit" ? "Submit a Claim" : "Track a Claim"}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {tab === "submit" ? (
          <SubmitClaim onTracked={() => setTab("track")} />
        ) : (
          <TrackClaim />
        )}
      </motion.div>
    </div>
  );
}

/* ----------------------------- Submit ----------------------------- */
function SubmitClaim({ onTracked }: { onTracked: () => void }) {
  const [submitted, setSubmitted] = React.useState<Claim | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClaimInput>({
    resolver: zodResolver(claimSchema),
    mode: "onBlur",
    defaultValues: {
      policyNumber: "",
      customerName: "",
      incidentDate: "",
      claimType: "",
      amount: undefined as unknown as number,
      description: "",
      documentName: "",
    },
  });

  const onSubmit = async (values: ClaimInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(data.claim);
      reset();
      setFileName("");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl glass p-8 text-center"
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </span>
          <h3 className="mt-5 text-2xl font-bold">Claim submitted successfully</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your claim reference is{" "}
            <span className="font-semibold text-white">{submitted.claimId}</span>. We&apos;ll review it
            and keep you updated.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={onTracked}>Track this claim</Button>
            <Button variant="outline" onClick={() => setSubmitted(null)}>Submit another</Button>
          </div>
        </motion.div>
        <div className="mt-6">
          <ClaimTimeline claim={submitted} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl glass p-6 md:p-8">
        <div className="mb-6 flex items-center gap-2">
          <FilePlus2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Claim Submission Form</h3>
        </div>

        <div className="grid gap-x-5 sm:grid-cols-2">
          <Field label="Policy Number" htmlFor="policyNumber" required error={errors.policyNumber?.message} hint="e.g. POL-2026-00001">
            <Input id="policyNumber" invalid={!!errors.policyNumber} placeholder="POL-2026-00001" {...register("policyNumber")} />
          </Field>
          <Field label="Customer Name" htmlFor="customerName" required error={errors.customerName?.message}>
            <Input id="customerName" invalid={!!errors.customerName} placeholder="Full name" {...register("customerName")} />
          </Field>
          <Field label="Incident Date" htmlFor="incidentDate" required error={errors.incidentDate?.message}>
            <Input id="incidentDate" type="date" invalid={!!errors.incidentDate} {...register("incidentDate")} />
          </Field>
          <Field label="Claim Type" htmlFor="claimType" required error={errors.claimType?.message}>
            <Select id="claimType" invalid={!!errors.claimType} defaultValue="" {...register("claimType")}>
              <option value="" disabled>Select a type</option>
              {CLAIM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Claim Amount (₹)" htmlFor="amount" required error={errors.amount?.message} className="sm:col-span-2">
            <Input id="amount" type="number" inputMode="numeric" invalid={!!errors.amount} placeholder="50000" {...register("amount")} />
          </Field>
          <Field label="Description" htmlFor="description" required error={errors.description?.message} className="sm:col-span-2">
            <Textarea id="description" invalid={!!errors.description} placeholder="Describe what happened…" {...register("description")} />
          </Field>
        </div>

        {/* File upload (captures file name) */}
        <div className="sm:col-span-2">
          <p className="mb-1.5 text-sm font-medium text-foreground/90">Supporting Document</p>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-4 transition-colors hover:border-primary/40 hover:bg-white/[0.04]">
            <Upload className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {fileName ? <span className="text-white">{fileName}</span> : "Click to attach a file (PDF, JPG, PNG)"}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.zip"
              onChange={(e) => {
                const name = e.target.files?.[0]?.name || "";
                setFileName(name);
                setValue("documentName", name, { shouldValidate: false });
              }}
            />
          </label>
        </div>

        {serverError && (
          <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Claim"}
        </Button>
      </form>
    </div>
  );
}

/* ----------------------------- Track ----------------------------- */
function TrackClaim() {
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Claim[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = q.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const key = value.toUpperCase().startsWith("CLM") ? "claimId" : "policyId";
      const res = await fetch(`/api/claims?${key}=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (data.ok && data.claims.length > 0) {
        setResults(data.claims);
      } else {
        setError("No claims found. Try a claim ID (CLM-…) or policy number (POL-…).");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={search} className="rounded-2xl glass p-6">
        <p className="mb-1.5 text-sm font-medium text-foreground/90">Enter Claim ID or Policy Number</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="CLM-2026-0001 or POL-2026-00001" className="pl-10" />
          </div>
          <Button type="submit" disabled={loading || !q.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Try demo claims: <button type="button" className="text-primary hover:underline" onClick={() => setQ("CLM-2026-0001")}>CLM-2026-0001</button>
          {" · "}
          <button type="button" className="text-primary hover:underline" onClick={() => setQ("CLM-2026-0002")}>CLM-2026-0002</button>
        </p>
      </form>

      {error && (
        <p className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {error}
        </p>
      )}

      {results && (
        <div className="mt-6 space-y-4">
          {results.map((c) => (
            <ClaimTimeline key={c.claimId} claim={c} />
          ))}
        </div>
      )}
    </div>
  );
}
