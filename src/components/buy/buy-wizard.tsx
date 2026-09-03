"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  User,
  ClipboardCheck,
  Users,
  Calculator,
  CreditCard,
  PartyPopper,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Download,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/ui/category-icon";
import {
  personalInfoFormSchema,
  nomineeSchema,
  paymentSchema,
  type PersonalInfo,
  type PersonalInfoForm,
  type Nominee,
  type PaymentInfo,
} from "@/lib/schemas";
import { computeQuote } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import type { Plan } from "@/lib/types";

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Plan", icon: ClipboardCheck },
  { label: "Nominee", icon: Users },
  { label: "Premium", icon: Calculator },
  { label: "Payment", icon: CreditCard },
  { label: "Done", icon: PartyPopper },
];

interface SuccessData {
  policyId: string;
  reference: string;
  paymentId: string;
  amount: number;
  issuedOn: string;
  email: string;
}

export function BuyWizard({ plan, initialTerm }: { plan: Plan; initialTerm: number }) {
  const [step, setStep] = React.useState(0);
  const [personal, setPersonal] = React.useState<PersonalInfo | null>(null);
  const [nominee, setNominee] = React.useState<Nominee | null>(null);
  const [term, setTerm] = React.useState(initialTerm);
  const [coverageIdx, setCoverageIdx] = React.useState(1);
  const [success, setSuccess] = React.useState<SuccessData | null>(null);

  const multipliers = [0.5, 1, 1.5, 2];
  const multiplier = multipliers[coverageIdx];
  const quote = computeQuote(plan, term, multiplier);
  const maxTerm = plan.category === "Life" ? 40 : 5;

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="mx-auto max-w-3xl">
      {/* Plan summary bar */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl glass p-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/20 ring-1 ring-white/10">
          <CategoryIcon category={plan.category} className="h-5 w-5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{plan.name}</p>
          <p className="text-xs text-muted-foreground">{plan.category} · {formatCurrency(plan.premium)}/mo base</p>
        </div>
        <Badge className="ml-auto border-white/10 bg-white/5 text-muted-foreground">{plan.duration}</Badge>
      </div>

      {/* Stepper */}
      <Stepper step={step} />

      <div className="mt-8">
        {/* Keyed remount (no exit gate) so each step mounts immediately —
            robust for reduced-motion and never depends on an animation completing. */}
        <div>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
          >
            {step === 0 && (
              <PersonalStep
                defaults={personal}
                onNext={(d) => { setPersonal(d); goNext(); }}
              />
            )}
            {step === 1 && (
              <SelectionStep
                plan={plan}
                term={term}
                maxTerm={maxTerm}
                coverageIdx={coverageIdx}
                multipliers={multipliers}
                onTerm={setTerm}
                onCoverage={setCoverageIdx}
                onBack={goBack}
                onNext={goNext}
              />
            )}
            {step === 2 && (
              <NomineeStep
                defaults={nominee}
                onBack={goBack}
                onNext={(d) => { setNominee(d); goNext(); }}
              />
            )}
            {step === 3 && (
              <PremiumStep
                plan={plan}
                term={term}
                coverageAmount={Math.round(plan.coverage * multiplier)}
                quote={quote}
                onBack={goBack}
                onNext={goNext}
              />
            )}
            {step === 4 && personal && nominee && (
              <PaymentStep
                plan={plan}
                term={term}
                amount={quote.total}
                personal={personal}
                nominee={nominee}
                onBack={goBack}
                onSuccess={(d) => { setSuccess(d); goNext(); }}
              />
            )}
            {step === 5 && success && (
              <SuccessStep plan={plan} data={success} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Stepper ------------------------------ */
function Stepper({ step }: { step: number }) {
  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-5 h-0.5 bg-white/10" />
      <motion.div
        className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-[hsl(214_100%_56%)] to-[hsl(199_89%_55%)]"
        initial={false}
        animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        transition={{ duration: 0.4 }}
      />
      <div className="relative flex justify-between">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
              <span
                className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-emerald-400 bg-emerald-400 text-black"
                    : active
                    ? "border-primary bg-primary text-white"
                    : "border-white/20 bg-[hsl(222_40%_10%)] text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className={`hidden text-xs font-medium sm:block ${active || done ? "text-white" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Step 1 ------------------------------ */
function PersonalStep({ defaults, onNext }: { defaults: PersonalInfo | null; onNext: (d: PersonalInfo) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoFormSchema),
    mode: "onBlur",
    defaultValues: defaults
      ? { ...defaults, confirmPassword: defaults.password }
      : { name: "", email: "", phone: "", address: "", password: "", confirmPassword: "" },
  });

  const submit = (d: PersonalInfoForm) => {
    const { confirmPassword: _confirmPassword, ...personal } = d;
    onNext(personal);
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="rounded-2xl glass p-6 md:p-8">
      <h3 className="mb-1 text-lg font-bold">Personal Information</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        Tell us who we&apos;re protecting. This also creates your dashboard login.
      </p>
      <div className="grid gap-x-5 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" invalid={!!errors.name} placeholder="e.g. Aarav Sharma" {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" invalid={!!errors.email} placeholder="you@example.com" {...register("email")} />
        </Field>
        <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
          <Input id="phone" invalid={!!errors.phone} placeholder="+91 98765 43210" {...register("phone")} />
        </Field>
        <Field label="Address" htmlFor="address" required error={errors.address?.message}>
          <Input id="address" invalid={!!errors.address} placeholder="City, State, PIN" {...register("address")} />
        </Field>
        <Field
          label="Create Password"
          htmlFor="password"
          required
          error={errors.password?.message}
          hint="Used to sign in to your dashboard later."
        >
          <Input id="password" type="password" invalid={!!errors.password} placeholder="••••••••" {...register("password")} />
        </Field>
        <Field label="Confirm Password" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" invalid={!!errors.confirmPassword} placeholder="••••••••" {...register("confirmPassword")} />
        </Field>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit">Continue <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </form>
  );
}

/* ------------------------------ Step 2 ------------------------------ */
function SelectionStep({
  plan, term, maxTerm, coverageIdx, multipliers, onTerm, onCoverage, onBack, onNext,
}: {
  plan: Plan; term: number; maxTerm: number; coverageIdx: number; multipliers: number[];
  onTerm: (n: number) => void; onCoverage: (n: number) => void; onBack: () => void; onNext: () => void;
}) {
  const coverageAmount = Math.round(plan.coverage * multipliers[coverageIdx]);
  return (
    <div className="rounded-2xl glass p-6 md:p-8">
      <h3 className="mb-1 text-lg font-bold">Policy Selection</h3>
      <p className="mb-6 text-sm text-muted-foreground">Customise your term and coverage.</p>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Policy term</span>
            <span className="font-semibold text-white">{term} {term === 1 ? "year" : "years"}</span>
          </div>
          <input type="range" min={1} max={maxTerm} step={1} value={term}
            onChange={(e) => onTerm(Number(e.target.value))}
            className="w-full accent-[hsl(214_100%_56%)]" />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Coverage amount</p>
          <div className="grid grid-cols-4 gap-2">
            {multipliers.map((m, i) => (
              <button key={m} type="button" onClick={() => onCoverage(i)}
                className={`rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
                  coverageIdx === i ? "bg-gradient-to-r from-[hsl(214_100%_56%)] to-[hsl(199_89%_55%)] text-white" : "glass text-muted-foreground hover:text-white"
                }`}>{m}×</button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Sum insured: <span className="font-semibold text-white">{formatCurrency(coverageAmount)}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Button onClick={onNext}>Continue <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

/* ------------------------------ Step 3 ------------------------------ */
function NomineeStep({ defaults, onBack, onNext }: { defaults: Nominee | null; onBack: () => void; onNext: (d: Nominee) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<Nominee>({
    resolver: zodResolver(nomineeSchema),
    mode: "onBlur",
    defaultValues: defaults ?? { nomineeName: "", nomineeRelation: "", nomineeAge: undefined as unknown as number },
  });
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="rounded-2xl glass p-6 md:p-8">
      <h3 className="mb-1 text-lg font-bold">Nominee Information</h3>
      <p className="mb-6 text-sm text-muted-foreground">Who should receive the benefit?</p>
      <div className="grid gap-x-5 sm:grid-cols-2">
        <Field label="Nominee Name" htmlFor="nomineeName" required error={errors.nomineeName?.message}>
          <Input id="nomineeName" invalid={!!errors.nomineeName} placeholder="Full name" {...register("nomineeName")} />
        </Field>
        <Field label="Relationship" htmlFor="nomineeRelation" required error={errors.nomineeRelation?.message}>
          <Input id="nomineeRelation" invalid={!!errors.nomineeRelation} placeholder="e.g. Spouse" {...register("nomineeRelation")} />
        </Field>
        <Field label="Nominee Age" htmlFor="nomineeAge" required error={errors.nomineeAge?.message}>
          <Input id="nomineeAge" type="number" inputMode="numeric" invalid={!!errors.nomineeAge} placeholder="e.g. 34" {...register("nomineeAge")} />
        </Field>
      </div>
      <div className="mt-4 flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Button type="submit">Continue <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </form>
  );
}

/* ------------------------------ Step 4 ------------------------------ */
function PremiumStep({
  plan, term, coverageAmount, quote, onBack, onNext,
}: {
  plan: Plan; term: number; coverageAmount: number;
  quote: ReturnType<typeof computeQuote>; onBack: () => void; onNext: () => void;
}) {
  return (
    <div className="rounded-2xl glass p-6 md:p-8">
      <h3 className="mb-1 text-lg font-bold">Premium Calculation</h3>
      <p className="mb-6 text-sm text-muted-foreground">Review your premium before payment.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-5">
          <p className="text-sm text-muted-foreground">Sum insured</p>
          <p className="mt-1 text-2xl font-extrabold text-white">{formatCurrency(coverageAmount)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{plan.name} · {term} {term === 1 ? "year" : "years"}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="space-y-2 text-sm">
            <Row label="Premium / month" value={formatCurrency(quote.monthly)} />
            <Row label={`Base (${term} yr)`} value={formatCurrency(quote.base)} />
            <Row label="GST (18%)" value={formatCurrency(quote.gst)} />
            <div className="mt-2 border-t border-white/10 pt-2">
              <Row label="Total payable" value={formatCurrency(quote.total)} strong />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Button onClick={onNext}>Proceed to Payment <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

/* ------------------------------ Step 5 ------------------------------ */
function detectCardMethod(num: string): string {
  const n = num.replace(/\s+/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  return "Card";
}

function PaymentStep({
  plan, term, amount, personal, nominee, onBack, onSuccess,
}: {
  plan: Plan; term: number; amount: number;
  personal: PersonalInfo; nominee: Nominee;
  onBack: () => void; onSuccess: (d: SuccessData) => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentInfo>({
    resolver: zodResolver(paymentSchema),
    mode: "onBlur",
    defaultValues: { cardName: personal.name, cardNumber: "", expiry: "", cvv: "" },
  });

  const cardNumber = watch("cardNumber") || "";
  const method = detectCardMethod(cardNumber);

  const onSubmit = async (values: PaymentInfo) => {
    setServerError(null);
    const digits = values.cardNumber.replace(/\s+/g, "");
    const last4 = digits.slice(-4);
    try {
      const res = await fetch("/api/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          term,
          personal,
          nominee,
          amount,
          last4,
          method,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setServerError(data.error || "Payment failed. Please try again.");
        return;
      }
      onSuccess({
        policyId: data.policyId,
        reference: data.reference,
        paymentId: data.paymentId,
        amount: data.amount,
        issuedOn: data.issuedOn,
        email: data.email,
      });
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl glass p-6 md:p-8">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-bold">Payment</h3>
        <span className="flex items-center gap-1.5 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4" /> 256-bit secure
        </span>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        Amount payable: <span className="font-semibold text-white">{formatCurrency(amount)}</span>
      </p>

      <div className="mb-5 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-xs text-sky-200">
        <p className="font-semibold">Demo mode — use this test card</p>
        <p className="mt-1">Visa 4111 1111 1111 1111 · Expiry 12/30 · CVV 123. No real payment is processed.</p>
      </div>

      <div className="grid gap-x-5 sm:grid-cols-2">
        <Field label="Name on Card" htmlFor="cardName" required error={errors.cardName?.message} className="sm:col-span-2">
          <Input id="cardName" invalid={!!errors.cardName} placeholder="Cardholder name" {...register("cardName")} />
        </Field>
        <Field label="Card Number" htmlFor="cardNumber" required error={errors.cardNumber?.message} className="sm:col-span-2"
          hint={method !== "Card" ? `Detected: ${method}` : undefined}>
          <Input id="cardNumber" inputMode="numeric" maxLength={19} invalid={!!errors.cardNumber} placeholder="4111 1111 1111 1111" {...register("cardNumber")} />
        </Field>
        <Field label="Expiry (MM/YY)" htmlFor="expiry" required error={errors.expiry?.message}>
          <Input id="expiry" maxLength={5} invalid={!!errors.expiry} placeholder="12/30" {...register("expiry")} />
        </Field>
        <Field label="CVV" htmlFor="cvv" required error={errors.cvv?.message}>
          <Input id="cvv" type="password" inputMode="numeric" maxLength={3} invalid={!!errors.cvv} placeholder="123" {...register("cvv")} />
        </Field>
      </div>

      {serverError && (
        <p className="mt-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {serverError}
        </p>
      )}

      <div className="mt-4 flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <>Pay {formatCurrency(amount)}</>}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------ Step 6 ------------------------------ */
function SuccessStep({ plan, data }: { plan: Plan; data: SuccessData }) {
  const [copied, setCopied] = React.useState(false);

  const copyPolicy = async () => {
    try {
      await navigator.clipboard.writeText(data.policyId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard may be unavailable */ }
  };

  const downloadReceipt = () => {
    const content = [
      "INSUREPLUS — PAYMENT RECEIPT",
      "====================================",
      `Policy Number:   ${data.policyId}`,
      `Plan:            ${plan.name}`,
      `Payment ID:      ${data.paymentId}`,
      `Reference:       ${data.reference}`,
      `Amount Paid:     ${formatCurrency(data.amount)}`,
      `Issued On:       ${data.issuedOn}`,
      `Registered Email:${data.email}`,
      "",
      "Thank you for choosing InsurePlus.",
      "This is a demo receipt. IRDAI Reg. No. 000.",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.policyId}-receipt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl glass p-8 text-center">
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30"
      >
        <PartyPopper className="h-10 w-10 text-emerald-400" />
      </motion.span>
      <h3 className="mt-6 text-2xl font-bold sm:text-3xl">Policy Purchased Successfully!</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Your {plan.name} policy is now active. A confirmation has been sent to {data.email}.
      </p>

      <div className="mx-auto mt-6 max-w-md space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Policy Number</span>
          <span className="flex items-center gap-2 font-bold text-white">
            {data.policyId}
            <button type="button" onClick={copyPolicy} aria-label="Copy policy number" className="text-primary hover:text-white">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </span>
        </div>
        <Row label="Payment Reference" value={data.reference} />
        <Row label="Payment ID" value={data.paymentId} />
        <Row label="Amount Paid" value={formatCurrency(data.amount)} strong />
        <Row label="Issued On" value={data.issuedOn} />
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={downloadReceipt}><Download className="h-4 w-4" /> Download Receipt</Button>
        <Link href="/dashboard"><Button variant="secondary">Go to Dashboard</Button></Link>
        <Link href="/plans"><Button variant="outline">Browse more plans</Button></Link>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "text-base font-bold text-gradient" : "font-medium text-foreground"}>{value}</span>
    </div>
  );
}
