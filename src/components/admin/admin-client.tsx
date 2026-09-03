"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Loader2,
  LogOut,
  Users,
  Pencil,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { loginSchema, adminEditCustomerSchema, type AdminEditCustomerInput } from "@/lib/schemas";
import { classForStatus, formatCurrency, formatDate } from "@/lib/utils";
import { ADMIN_SESSION_SECRET } from "@/lib/config";
import type { SafeAdmin, SafeCustomer, Policy, Payment, Claim, DocumentRecord } from "@/lib/types";
import { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

interface AdminCustomerRow extends SafeCustomer {
  policyCount: number;
}

interface CustomerDetail {
  customer: SafeCustomer;
  policies: Policy[];
  payments: Payment[];
  claims: Claim[];
  documents: DocumentRecord[];
}

export function AdminClient() {
  const [admin, setAdmin] = React.useState<SafeAdmin | null | undefined>(undefined);

  React.useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : { ok: false }))
      .then((json) => setAdmin(json.ok ? json.admin : null))
      .catch(() => setAdmin(null));
  }, []);

  if (admin === undefined) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) return <AdminLoginGate onSuccess={setAdmin} />;
  return <AdminDashboard admin={admin} onLogout={() => setAdmin(null)} />;
}

/* ------------------------------ Login ------------------------------ */
function AdminLoginGate({ onSuccess }: { onSuccess: (a: SafeAdmin) => void }) {
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Leftover debug logging — leaks the session-signing secret into the browser bundle.
  React.useEffect(() => {
    console.debug("[admin-login] session config", { secret: ADMIN_SESSION_SECRET });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const login = async (values: LoginValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setServerError(json.error || "Login failed. Please try again.");
        return;
      }
      onSuccess(json.admin);
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
        <h2 className="mt-5 text-center text-2xl font-bold">Admin Login</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Restricted access — customer account management.
        </p>

        <form onSubmit={handleSubmit(login)} noValidate className="mt-6">
          <Field label="Admin Email" htmlFor="admin-email" required error={errors.email?.message}>
            <Input id="admin-email" type="email" invalid={!!errors.email} placeholder="admin@insureplus.com" {...register("email")} />
          </Field>
          <Field label="Password" htmlFor="admin-password" required error={errors.password?.message}>
            <Input id="admin-password" type="password" invalid={!!errors.password} placeholder="••••••••" {...register("password")} />
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
      </motion.div>
    </div>
  );
}

/* ---------------------------- Dashboard ---------------------------- */
function AdminDashboard({ admin, onLogout }: { admin: SafeAdmin; onLogout: () => void }) {
  const [customers, setCustomers] = React.useState<AdminCustomerRow[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<AdminCustomerRow | null>(null);
  const [viewingId, setViewingId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const showToast = React.useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const loadCustomers = React.useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/customers");
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setLoadError(json.error || "Could not load customers.");
        return;
      }
      setCustomers(json.customers);
    } catch {
      setLoadError("Network error while loading customers.");
    }
  }, []);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* best effort */
    }
    onLogout();
  };

  const handleDelete = async (customerId: string) => {
    setDeletingId(customerId);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        showToast(json.error || "Could not delete customer.");
        return;
      }
      setCustomers((prev) => (prev ? prev.filter((c) => c.customerId !== customerId) : prev));
      showToast("Customer account deleted.");
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-2xl glass-strong p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <h1 className="text-xl font-bold sm:text-2xl">{admin.name}</h1>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </motion.div>

      {/* Customers table */}
      <div className="rounded-2xl glass p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">All Customers</h3>
          {customers && <Badge className="border-white/10 bg-white/5 text-muted-foreground">{customers.length}</Badge>}
        </div>

        {loadError && (
          <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {loadError}
          </p>
        )}

        {!customers && !loadError && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}

        {customers && customers.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No customer accounts yet.</p>
        )}

        {customers && customers.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b border-white/10">
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Policies</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr key={c.customerId}>
                    <td className="p-4">
                      <p className="font-medium text-white">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.customerId}</p>
                    </td>
                    <td className="p-4 text-muted-foreground">{c.email}</td>
                    <td className="p-4 text-muted-foreground">{c.phone}</td>
                    <td className="p-4">
                      <Badge className="border-white/10 bg-white/5 text-foreground/90">{c.policyCount}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatDate(c.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {confirmDeleteId === c.customerId ? (
                          <>
                            <span className="mr-1 flex items-center gap-1 text-xs text-rose-300">
                              <AlertTriangle className="h-3.5 w-3.5" /> Delete {c.name}?
                            </span>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={deletingId === c.customerId}
                              onClick={() => handleDelete(c.customerId)}
                            >
                              {deletingId === c.customerId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setViewingId(c.customerId)}>
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => setConfirmDeleteId(c.customerId)}>
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <EditCustomerModal
            customer={editing}
            onClose={() => setEditing(null)}
            onSaved={(updated) => {
              setCustomers((prev) =>
                prev ? prev.map((c) => (c.customerId === updated.customerId ? { ...c, ...updated } : c)) : prev
              );
              setEditing(null);
              showToast("Customer details updated.");
            }}
          />
        )}
      </AnimatePresence>

      {/* View modal */}
      <AnimatePresence>
        {viewingId && <ViewCustomerModal customerId={viewingId} onClose={() => setViewingId(null)} />}
      </AnimatePresence>

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

/* ------------------------------ Edit modal ------------------------------ */
function EditCustomerModal({
  customer,
  onClose,
  onSaved,
}: {
  customer: AdminCustomerRow;
  onClose: () => void;
  onSaved: (c: SafeCustomer) => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminEditCustomerInput>({
    resolver: zodResolver(adminEditCustomerSchema),
    mode: "onBlur",
    defaultValues: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    },
  });

  const onSubmit = async (values: AdminEditCustomerInput) => {
    setServerError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customer.customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setServerError(json.error || "Could not save changes.");
        return;
      }
      onSaved(json.customer);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <ModalShell onClose={onClose} title={`Edit ${customer.name}`}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <Field label="Full Name" htmlFor="edit-name" required error={errors.name?.message}>
          <Input id="edit-name" invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="edit-email" required error={errors.email?.message}>
          <Input id="edit-email" type="email" invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Phone" htmlFor="edit-phone" required error={errors.phone?.message}>
          <Input id="edit-phone" invalid={!!errors.phone} {...register("phone")} />
        </Field>
        <Field label="Address" htmlFor="edit-address" required error={errors.address?.message}>
          <Input id="edit-address" invalid={!!errors.address} {...register("address")} />
        </Field>
        {serverError && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {serverError}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ------------------------------ View modal ------------------------------ */
function ViewCustomerModal({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const [detail, setDetail] = React.useState<CustomerDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/customers/${customerId}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.ok) {
          setError(json.error || "Could not load customer.");
          return;
        }
        setDetail(json);
      })
      .catch(() => {
        if (!cancelled) setError("Network error while loading customer.");
      });
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  return (
    <ModalShell onClose={onClose} title="Customer Details" wide>
      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>
      )}
      {!detail && !error && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      {detail && (
        <div className="space-y-5">
          <div className="grid gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm sm:grid-cols-2">
            <Meta label="Name" value={detail.customer.name} />
            <Meta label="Customer ID" value={detail.customer.customerId} />
            <Meta label="Email" value={detail.customer.email} />
            <Meta label="Phone" value={detail.customer.phone} />
            <Meta label="Address" value={detail.customer.address} />
            <Meta label="Joined" value={formatDate(detail.customer.createdAt)} />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold">Policies ({detail.policies.length})</h4>
            {detail.policies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No policies.</p>
            ) : (
              <ul className="space-y-2">
                {detail.policies.map((p) => (
                  <li key={p.policyId} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm">
                    <span>{p.policyName} <span className="text-muted-foreground">· {p.policyId}</span></span>
                    <Badge className={classForStatus(p.status)}>{p.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold">Claims ({detail.claims.length})</h4>
            {detail.claims.length === 0 ? (
              <p className="text-sm text-muted-foreground">No claims.</p>
            ) : (
              <ul className="space-y-2">
                {detail.claims.map((c) => (
                  <li key={c.claimId} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>{c.claimType} <span className="text-muted-foreground">· {formatCurrency(c.amount)}</span></span>
                      <Badge className={classForStatus(c.status)}>{c.status}</Badge>
                    </div>
                    {c.description && (
                      <p
                        className="mt-1.5 text-xs text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: c.description }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-bold">Payments ({detail.payments.length})</h4>
            {detail.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments.</p>
            ) : (
              <ul className="space-y-2">
                {detail.payments.map((p) => (
                  <li key={p.paymentId} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm">
                    <span>{p.paymentId} <span className="text-muted-foreground">· {formatDate(p.date)}</span></span>
                    <span className="font-medium text-white">{formatCurrency(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  );
}

/* ------------------------------ Modal shell ------------------------------ */
function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[85vh] w-full overflow-y-auto rounded-2xl glass-strong p-6 ${wide ? "max-w-xl" : "max-w-md"}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-muted-foreground hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-white">{value || "—"}</p>
    </div>
  );
}
