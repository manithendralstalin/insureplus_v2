"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Wallet,
  FileText,
  Bell,
  Download,
  RefreshCw,
  LogOut,
  Lock,
  Loader2,
  CalendarClock,
  CheckCircle2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { CoveragePie, PaymentsArea } from "@/components/dashboard/charts";
import { loginSchema, changePasswordSchema, type ChangePasswordInput } from "@/lib/schemas";
import { PLANS } from "@/lib/plans";
import { classForStatus, formatCurrency, formatDate } from "@/lib/utils";
import type { SafeCustomer, Policy, Payment, Claim, DocumentRecord } from "@/lib/types";
import { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

interface DashboardData {
  customer: SafeCustomer;
  policies: Policy[];
  payments: Payment[];
  claims: Claim[];
  documents: DocumentRecord[];
}

const DEMO_EMAIL = "aarav.sharma@example.com";
const DEMO_PASSWORD = "Demo@1234";

/** sessionStorage key holding the logged-in customer's dashboard payload. */
const SESSION_KEY = "insureplus_dashboard";
/** URL marker (?view=home) used to give the authenticated view its own history entry. */
const HOME_VIEW = "home";

export function DashboardClient() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [authed, setAuthed] = React.useState(false);

  // Decide what to render from (a) the current URL's ?view= marker and (b) the
  // cached session in sessionStorage.
  //
  // VULNERABILITY — Broken Access Control / improper session termination.
  // The session is restored from sessionStorage with NO re-authentication, and
  // (see handleLogout) sign-out does NOT clear it. Combined with the ?view=home
  // history entry, this means the browser Back button re-renders the previous
  // user's full dashboard — policies, payments, claims, documents — after they
  // have "logged out". On a shared machine the next person just presses Back.
  const syncFromLocation = React.useCallback(() => {
    const isHomeView = new URLSearchParams(window.location.search).get("view") === HOME_VIEW;
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (isHomeView && raw) {
      try {
        setData(JSON.parse(raw) as DashboardData);
        setAuthed(true);
        return;
      } catch {
        /* fall through to the login gate */
      }
    }
    setData(null);
    setAuthed(false);
  }, []);

  React.useEffect(() => {
    syncFromLocation();
    // Re-evaluate whenever the user navigates through history (Back / Forward).
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [syncFromLocation]);

  const handleLoginSuccess = (d: DashboardData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(d));
    // Give the authenticated view its own history entry so Back has somewhere
    // to return to.
    window.history.pushState(null, "", "/dashboard?view=" + HOME_VIEW);
    setData(d);
    setAuthed(true);
  };

  const handleRefresh = (d: DashboardData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(d));
    setData(d);
  };

  const handleLogout = () => {
    // Sign-out returns the user to the dashboard login screen.
    window.history.pushState(null, "", "/dashboard");
    setData(null);
    setAuthed(false);
    // BUG (intentional): sessionStorage is NOT cleared, so pressing Back returns
    // to /dashboard?view=home and syncFromLocation() re-hydrates the session
    // without any re-authentication. The secure version would call:
    //   sessionStorage.removeItem(SESSION_KEY)
  };

  if (!authed || !data) return <LoginGate onSuccess={handleLoginSuccess} />;
  return <DashboardView data={data} onLogout={handleLogout} onRefresh={handleRefresh} />;
}

/* ------------------------------ Login ------------------------------ */
function LoginGate({ onSuccess }: { onSuccess: (d: DashboardData) => void }) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const login = async (values: LoginValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setServerError(json.error || "Login failed. Please try again.");
        return;
      }
      onSuccess(json);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl glass p-8"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 ring-1 ring-white/10">
          <Lock className="h-6 w-6 text-primary" />
        </span>
        <h2 className="mt-5 text-center text-2xl font-bold">Secure Login</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Access your policies, payments and claims.
        </p>

        <form onSubmit={handleSubmit(login)} noValidate className="mt-6">
          <Field label="Registered Email" htmlFor="email" required error={errors.email?.message}>
            <Input id="email" type="email" invalid={!!errors.email} placeholder="you@example.com" {...register("email")} />
          </Field>
          <Field label="Password" htmlFor="password" required error={errors.password?.message}>
            <Input id="password" type="password" invalid={!!errors.password} placeholder="••••••••" {...register("password")} />
          </Field>
          {serverError && (
            <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              {serverError}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign In"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setValue("email", DEMO_EMAIL, { shouldValidate: true });
            setValue("password", DEMO_PASSWORD, { shouldValidate: true });
          }}
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-center text-xs text-muted-foreground transition-colors hover:text-white"
        >
          Use demo account: <span className="font-semibold text-primary">{DEMO_EMAIL}</span> / <span className="font-semibold text-primary">{DEMO_PASSWORD}</span>
        </button>
      </motion.div>
    </div>
  );
}

/* ---------------------------- Dashboard ---------------------------- */
function DashboardView({
  data,
  onLogout,
  onRefresh,
}: {
  data: DashboardData;
  onLogout: () => void;
  onRefresh: (d: DashboardData) => void;
}) {
  const { customer, policies, payments, claims, documents } = data;
  const [renewed, setRenewed] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<string | null>(null);

  const totalCoverage = policies.reduce((s, p) => s + Number(p.coverage || 0), 0);
  const activeCount = policies.filter((p) => (p.status || "").toLowerCase() === "active").length;
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const handleRenew = (policy: Policy) => {
    setRenewed((prev) => new Set(prev).add(policy.policyId));
    showToast(`${policy.policyName} renewal initiated. Confirmation sent to ${customer.email}.`);
  };

  const downloadDoc = (doc: DocumentRecord) => {
    // Fetches the file from the server document store by name. The filename is
    // sent verbatim as the `file` query param (see /api/documents), so this
    // request is where a path-traversal payload is introduced.
    const url = `/api/documents?file=${encodeURIComponent(doc.name)}`;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading ${doc.name}…`);
  };

  // Derived notifications
  const notifications = React.useMemo(() => {
    const list: { text: string; tone: string }[] = [];
    policies.forEach((p) => {
      list.push({ text: `Premium for ${p.policyName} due on ${formatDate(p.endDate)}`, tone: "amber" });
    });
    claims.forEach((c) => {
      list.push({ text: `Claim ${c.claimId} is ${c.status}`, tone: c.status.toLowerCase() === "approved" ? "emerald" : "sky" });
    });
    return list.slice(0, 5);
  }, [policies, claims]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-2xl glass-strong p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
            {customer.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-xl font-bold sm:text-2xl">{customer.name}</h1>
            <p className="text-xs text-muted-foreground">{customer.email} · {customer.customerId}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ShieldCheck} label="Total Coverage" value={formatCurrency(totalCoverage)} index={0} />
        <StatCard icon={FileText} label="Active Policies" value={String(activeCount)} sub={`${policies.length} total`} index={1} />
        <StatCard icon={Wallet} label="Premiums Paid" value={formatCurrency(totalPaid)} index={2} />
        <StatCard icon={RefreshCw} label="Claims Filed" value={String(claims.length)} index={3} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl glass p-6">
          <h3 className="mb-4 text-lg font-bold">Coverage by Category</h3>
          <CoveragePie policies={policies} />
        </div>
        <div className="rounded-2xl glass p-6">
          <h3 className="mb-4 text-lg font-bold">Payment History</h3>
          <PaymentsArea payments={payments} />
        </div>
      </div>

      {/* Policies + side column */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-lg font-bold">Your Policies</h3>
          {policies.length === 0 && (
            <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
              You have no policies yet. <Link href="/plans" className="text-primary hover:underline">Browse plans →</Link>
            </div>
          )}
          {policies.map((p) => {
            const isRenewed = renewed.has(p.policyId);
            return (
              <div key={p.policyId} className="rounded-2xl glass p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white">{p.policyName}</h4>
                      <Badge className={classForStatus(p.status)}>{p.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.policyId} · {p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Coverage</p>
                    <p className="font-bold text-white">{formatCurrency(p.coverage)}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm sm:grid-cols-4">
                  <Meta label="Premium" value={`${formatCurrency(p.premium)}/mo`} />
                  <Meta label="Start" value={formatDate(p.startDate)} />
                  <Meta label="Renewal / Due" value={formatDate(p.endDate)} />
                  <Meta label="Nominee" value={p.nominee || "—"} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {isRenewed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Renewal initiated
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => handleRenew(p)}>
                      <RefreshCw className="h-3.5 w-3.5" /> Renew Policy
                    </Button>
                  )}
                  {planIdFor(p.policyName) && (
                    <Link href={`/policy/${planIdFor(p.policyName)}`}>
                      <Button size="sm" variant="outline">View plan</Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {/* Payment history table */}
          <h3 className="pt-2 text-lg font-bold">Payment History</h3>
          <div className="overflow-x-auto rounded-2xl glass">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b border-white/10">
                  <th className="p-4 font-medium">Payment ID</th>
                  <th className="p-4 font-medium">Policy</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No payments yet.</td></tr>
                ) : payments.map((pay) => (
                  <tr key={pay.paymentId}>
                    <td className="p-4 font-medium text-white">{pay.paymentId}</td>
                    <td className="p-4 text-muted-foreground">{pay.policyId}</td>
                    <td className="p-4">{formatCurrency(pay.amount)}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(pay.date)}</td>
                    <td className="p-4 text-muted-foreground">{pay.method} ••{pay.last4}</td>
                    <td className="p-4"><Badge className={classForStatus(pay.status)}>{pay.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="rounded-2xl glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Notifications</h3>
            </div>
            <ul className="space-y-3">
              {notifications.map((n, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: toneColor(n.tone) }} />
                  <span className="text-foreground/90">{n.text}</span>
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="text-sm text-muted-foreground">You&apos;re all caught up.</li>
              )}
            </ul>
          </div>

          {/* Claims history */}
          <div className="rounded-2xl glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Claims History</h3>
            </div>
            <ul className="space-y-3">
              {claims.length === 0 && <li className="text-sm text-muted-foreground">No claims filed.</li>}
              {claims.map((c) => (
                <li key={c.claimId} className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium text-white">{c.claimId}</p>
                    <p className="text-xs text-muted-foreground">{c.claimType} · {formatCurrency(c.amount)}</p>
                  </div>
                  <Badge className={classForStatus(c.status)}>{c.status}</Badge>
                </li>
              ))}
            </ul>
            <Link href="/claims" className="mt-4 inline-block text-sm text-primary hover:underline">
              Go to Claims Portal →
            </Link>
          </div>

          {/* Documents */}
          <div className="rounded-2xl glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Documents</h3>
            </div>
            <ul className="space-y-2">
              {documents.length === 0 && <li className="text-sm text-muted-foreground">No documents available.</li>}
              {documents.map((d) => (
                <li key={d.documentId}>
                  <button
                    type="button"
                    onClick={() => downloadDoc(d)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-2 text-foreground/90">
                      <FileText className="h-4 w-4 text-primary" /> {d.name}
                    </span>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Change password */}
          <ChangePasswordCard email={customer.email} onSuccess={() => showToast("Password updated successfully.")} />

          {/* Renewal reminder */}
          <div className="rounded-2xl glass p-5">
            <div className="mb-2 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Upcoming Renewals</h3>
            </div>
            {policies.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                Next renewal:{" "}
                <span className="font-semibold text-white">
                  {formatDate([...policies].sort((a, b) => (a.endDate || "").localeCompare(b.endDate || ""))[0]?.endDate)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming renewals.</p>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full glass-strong px-5 py-3 text-sm text-white shadow-2xl"
        >
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toast}</span>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------ Change password ------------------------------ */
function ChangePasswordCard({ email, onSuccess }: { email: string; onSuccess: () => void }) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = async (values: ChangePasswordInput) => {
    setServerError(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setServerError(json.error || "Could not update password. Please try again.");
        return;
      }
      reset();
      onSuccess();
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="rounded-2xl glass p-5">
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" />
        <h3 className="font-bold">Change Password</h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <Field label="Current Password" htmlFor="currentPassword" required error={errors.currentPassword?.message}>
          <Input id="currentPassword" type="password" invalid={!!errors.currentPassword} placeholder="••••••••" {...register("currentPassword")} />
        </Field>
        <Field label="New Password" htmlFor="newPassword" required error={errors.newPassword?.message}>
          <Input id="newPassword" type="password" invalid={!!errors.newPassword} placeholder="••••••••" {...register("newPassword")} />
        </Field>
        <Field label="Confirm New Password" htmlFor="confirmNewPassword" required error={errors.confirmNewPassword?.message}>
          <Input id="confirmNewPassword" type="password" invalid={!!errors.confirmNewPassword} placeholder="••••••••" {...register("confirmNewPassword")} />
        </Field>
        {serverError && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {serverError}
          </p>
        )}
        <Button type="submit" size="sm" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Update Password"}
        </Button>
      </form>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-white">{value}</p>
    </div>
  );
}

function toneColor(tone: string) {
  return tone === "emerald" ? "#34d399" : tone === "amber" ? "#fbbf24" : "#38bdf8";
}

// Map a stored policy name back to its catalog plan id (for the "View plan" link)
function planIdFor(name: string): string | undefined {
  return PLANS.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id;
}
