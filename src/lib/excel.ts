import "server-only";
import * as XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";
import type {
  Customer,
  Policy,
  Claim,
  Payment,
  Agent,
  DocumentRecord,
  Admin,
} from "./types";

/** Demo password for the two seeded customers (see README). */
const SEED_PASSWORD = "Demo@1234";

/** Demo password for the seeded admin account (see README). */
const ADMIN_SEED_PASSWORD = "Admin@1234";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "insurance.xlsx");

export const SHEETS = {
  customers: "Customers",
  policies: "Policies",
  claims: "Claims",
  payments: "Payments",
  agents: "Agents",
  documents: "Documents",
  admins: "Admins",
} as const;

/* ------------------------------------------------------------------ */
/*  Simple in-process write lock so concurrent API writes never clash  */
/* ------------------------------------------------------------------ */
let writeChain: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => T | Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  // keep the chain alive even if a task rejects
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run as Promise<T>;
}

/* ------------------------------------------------------------------ */
/*  Seed data                                                          */
/* ------------------------------------------------------------------ */
function seed() {
  const customers: Customer[] = [
    {
      customerId: "CUST-0001",
      name: "Aarav Sharma",
      email: "aarav.sharma@example.com",
      phone: "+91 98765 43210",
      address: "12 Marine Drive, Mumbai, MH 400002",
      password: SEED_PASSWORD,
      createdAt: "2025-11-02",
    },
    {
      customerId: "CUST-0002",
      name: "Diya Nair",
      email: "diya.nair@example.com",
      phone: "+91 90123 45678",
      address: "44 MG Road, Bengaluru, KA 560001",
      password: SEED_PASSWORD,
      createdAt: "2026-01-18",
    },
  ];

  const policies: Policy[] = [
    {
      policyId: "POL-2026-00001",
      customerId: "CUST-0001",
      policyName: "Health Shield Elite",
      category: "Health",
      coverage: 10000000,
      premium: 1499,
      duration: "1 Year",
      status: "Active",
      startDate: "2026-02-01",
      endDate: "2027-01-31",
      nominee: "Isha Sharma",
      createdAt: "2026-02-01",
    },
    {
      policyId: "POL-2026-00002",
      customerId: "CUST-0001",
      policyName: "Motor Secure Comprehensive",
      category: "Motor",
      coverage: 1500000,
      premium: 583,
      duration: "1 Year",
      status: "Active",
      startDate: "2026-03-12",
      endDate: "2027-03-11",
      nominee: "Isha Sharma",
      createdAt: "2026-03-12",
    },
    {
      policyId: "POL-2026-00003",
      customerId: "CUST-0002",
      policyName: "Life Secure Term Plan",
      category: "Life",
      coverage: 20000000,
      premium: 999,
      duration: "40 Years",
      status: "Active",
      startDate: "2026-04-05",
      endDate: "2066-04-04",
      nominee: "Rohan Nair",
      createdAt: "2026-04-05",
    },
  ];

  const claims: Claim[] = [
    {
      claimId: "CLM-2026-0001",
      policyId: "POL-2026-00001",
      customerName: "Aarav Sharma",
      claimType: "Hospitalization",
      incidentDate: "2026-05-14",
      description: "Emergency appendectomy at network hospital.",
      amount: 185000,
      status: "Approved",
      submittedDate: "2026-05-16",
      documentName: "discharge-summary.pdf",
    },
    {
      claimId: "CLM-2026-0002",
      policyId: "POL-2026-00002",
      customerName: "Aarav Sharma",
      claimType: "Accident",
      incidentDate: "2026-06-22",
      description: "Front bumper damage from minor collision.",
      amount: 42000,
      status: "Under Review",
      submittedDate: "2026-06-24",
      documentName: "vehicle-photos.zip",
    },
  ];

  const payments: Payment[] = [
    {
      paymentId: "PAY-2026-0001",
      policyId: "POL-2026-00001",
      amount: 17988,
      date: "2026-02-01",
      status: "Success",
      last4: "1111",
      method: "Visa",
      reference: "REF-8FJ2K9Q1",
    },
    {
      paymentId: "PAY-2026-0002",
      policyId: "POL-2026-00002",
      amount: 6996,
      date: "2026-03-12",
      status: "Success",
      last4: "4444",
      method: "Mastercard",
      reference: "REF-7DK1M4P8",
    },
    {
      paymentId: "PAY-2026-0003",
      policyId: "POL-2026-00003",
      amount: 11988,
      date: "2026-04-05",
      status: "Success",
      last4: "1111",
      method: "Visa",
      reference: "REF-2QW9Z7X3",
    },
  ];

  const agents: Agent[] = [
    { agentId: "AGT-001", name: "Kabir Menon", email: "kabir.menon@insureplus.com", phone: "+91 98111 22233", region: "West", rating: 4.9 },
    { agentId: "AGT-002", name: "Sara Khan", email: "sara.khan@insureplus.com", phone: "+91 97444 55566", region: "South", rating: 4.8 },
    { agentId: "AGT-003", name: "Vikram Rao", email: "vikram.rao@insureplus.com", phone: "+91 96777 88899", region: "North", rating: 4.7 },
  ];

  const documents: DocumentRecord[] = [
    { documentId: "DOC-0001", policyId: "POL-2026-00001", name: "Policy Certificate.pdf", type: "Certificate", uploadedDate: "2026-02-01" },
    { documentId: "DOC-0002", policyId: "POL-2026-00001", name: "Tax Receipt 80D.pdf", type: "Receipt", uploadedDate: "2026-02-01" },
    { documentId: "DOC-0003", policyId: "POL-2026-00003", name: "Policy Certificate.pdf", type: "Certificate", uploadedDate: "2026-04-05" },
  ];

  const admins: Admin[] = [
    {
      adminId: "ADMIN-0001",
      name: "System Admin",
      email: "admin@insureplus.com",
      password: ADMIN_SEED_PASSWORD,
      createdAt: new Date().toISOString().slice(0, 10),
    },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customers), SHEETS.customers);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(policies), SHEETS.policies);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(claims), SHEETS.claims);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payments), SHEETS.payments);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(agents), SHEETS.agents);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(documents), SHEETS.documents);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(admins), SHEETS.admins);

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  XLSX.writeFile(wb, DB_PATH);
}

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) seed();
}

// Workbooks written before password auth existed have Customer rows with no
// password. Backfill those with the seed password (once per process) so
// existing accounts aren't permanently locked out.
let passwordsMigrated = false;
function migrateMissingPasswords(wb: XLSX.WorkBook): boolean {
  const ws = wb.Sheets[SHEETS.customers];
  if (!ws) return false;
  const rows = XLSX.utils.sheet_to_json<Customer>(ws, { defval: "" });
  let changed = false;
  for (const row of rows) {
    if (!row.password) {
      row.password = SEED_PASSWORD;
      changed = true;
    }
  }
  if (changed) {
    wb.Sheets[SHEETS.customers] = XLSX.utils.json_to_sheet(rows as unknown as Record<string, unknown>[]);
  }
  return changed;
}

// Workbooks written before admin accounts existed have no Admins sheet (or,
// after the plaintext-password change, an admin row left over from the old
// passwordHash schema with no "password" field). Seed/backfill so there's
// always something to log in with.
let adminsMigrated = false;
function migrateAdminsSheet(wb: XLSX.WorkBook): boolean {
  const ws = wb.Sheets[SHEETS.admins];
  const rows = ws ? XLSX.utils.sheet_to_json<Admin>(ws, { defval: "" }) : [];

  if (rows.length === 0) {
    const admin: Admin = {
      adminId: "ADMIN-0001",
      name: "System Admin",
      email: "admin@insureplus.com",
      password: ADMIN_SEED_PASSWORD,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    wb.Sheets[SHEETS.admins] = XLSX.utils.json_to_sheet([admin] as unknown as Record<string, unknown>[]);
    if (!wb.SheetNames.includes(SHEETS.admins)) wb.SheetNames.push(SHEETS.admins);
    return true;
  }

  let changed = false;
  for (const row of rows) {
    if (!row.password) {
      row.password = ADMIN_SEED_PASSWORD;
      changed = true;
    }
  }
  if (changed) {
    wb.Sheets[SHEETS.admins] = XLSX.utils.json_to_sheet(rows as unknown as Record<string, unknown>[]);
  }
  return changed;
}

function loadBook(): XLSX.WorkBook {
  ensureDb();
  const wb = XLSX.readFile(DB_PATH, { cellDates: false });
  let dirty = false;
  if (!passwordsMigrated) {
    passwordsMigrated = true;
    if (migrateMissingPasswords(wb)) dirty = true;
  }
  if (!adminsMigrated) {
    adminsMigrated = true;
    if (migrateAdminsSheet(wb)) dirty = true;
  }
  if (dirty) XLSX.writeFile(wb, DB_PATH);
  return wb;
}

function saveBook(wb: XLSX.WorkBook) {
  XLSX.writeFile(wb, DB_PATH);
}

function readSheet<T>(name: string): T[] {
  const wb = loadBook();
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<T>(ws, { defval: "" });
}

function writeSheet<T>(name: string, rows: T[]) {
  const wb = loadBook();
  const ws = XLSX.utils.json_to_sheet(rows as Record<string, unknown>[]);
  wb.Sheets[name] = ws;
  if (!wb.SheetNames.includes(name)) wb.SheetNames.push(name);
  saveBook(wb);
}

/* ------------------------------------------------------------------ */
/*  Public read helpers                                                */
/* ------------------------------------------------------------------ */
export function getCustomers() { return readSheet<Customer>(SHEETS.customers); }
export function getPolicies() { return readSheet<Policy>(SHEETS.policies); }
export function getClaims() { return readSheet<Claim>(SHEETS.claims); }
export function getPayments() { return readSheet<Payment>(SHEETS.payments); }
export function getAgents() { return readSheet<Agent>(SHEETS.agents); }
export function getDocuments() { return readSheet<DocumentRecord>(SHEETS.documents); }

export function getCustomerByEmail(email: string): Customer | undefined {
  const target = email.trim().toLowerCase();
  return getCustomers().find((c) => (c.email || "").toLowerCase() === target);
}

export function getCustomerById(customerId: string): Customer | undefined {
  return getCustomers().find((c) => c.customerId === customerId);
}

export function getAdmins() { return readSheet<Admin>(SHEETS.admins); }

export function getAdminByEmail(email: string): Admin | undefined {
  const target = email.trim().toLowerCase();
  return getAdmins().find((a) => (a.email || "").toLowerCase() === target);
}

export function getAdminById(adminId: string): Admin | undefined {
  return getAdmins().find((a) => a.adminId === adminId);
}

/** Verifies email + password against the stored admin value. Returns the admin on success. */
export function verifyAdminPassword(email: string, password: string): Admin | null {
  const admin = getAdminByEmail(email);
  if (!admin || !admin.password) return null;
  return admin.password === password ? admin : null;
}

/* ------------------------------------------------------------------ */
/*  ID generation                                                      */
/* ------------------------------------------------------------------ */
function nextSeq(ids: string[], prefix: string): number {
  let max = 0;
  for (const id of ids) {
    const m = String(id).match(/(\d+)\s*$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

export function newPolicyId(): string {
  const seq = nextSeq(getPolicies().map((p) => p.policyId), "POL");
  return `POL-2026-${String(seq).padStart(5, "0")}`;
}
export function newCustomerId(): string {
  const seq = nextSeq(getCustomers().map((c) => c.customerId), "CUST");
  return `CUST-${String(seq).padStart(4, "0")}`;
}
export function newClaimId(): string {
  const seq = nextSeq(getClaims().map((c) => c.claimId), "CLM");
  return `CLM-2026-${String(seq).padStart(4, "0")}`;
}
export function newPaymentId(): string {
  const seq = nextSeq(getPayments().map((p) => p.paymentId), "PAY");
  return `PAY-2026-${String(seq).padStart(4, "0")}`;
}
export function newDocumentId(): string {
  const seq = nextSeq(getDocuments().map((d) => d.documentId), "DOC");
  return `DOC-${String(seq).padStart(4, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Public write helpers (serialised through the lock)                 */
/* ------------------------------------------------------------------ */
export function addCustomer(c: Customer) {
  return withLock(() => {
    const rows = getCustomers();
    rows.push(c);
    writeSheet(SHEETS.customers, rows);
    return c;
  });
}

export function upsertCustomer(
  input: Omit<Customer, "customerId" | "createdAt" | "password"> & {
    customerId?: string;
    password: string;
  }
) {
  return withLock(() => {
    const rows = getCustomers();
    const existing = rows.find((r) => r.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      Object.assign(existing, { name: input.name, phone: input.phone, address: input.address });
      // Never silently overwrite an existing password on a repeat purchase.
      if (!existing.password) {
        existing.password = input.password;
      }
      writeSheet(SHEETS.customers, rows);
      return existing;
    }
    const created: Customer = {
      customerId: input.customerId || `CUST-${String(nextSeq(rows.map((r) => r.customerId), "CUST")).padStart(4, "0")}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      password: input.password,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    rows.push(created);
    writeSheet(SHEETS.customers, rows);
    return created;
  });
}

/** Verifies email + password against the stored value. Returns the customer on success. */
export function verifyCustomerPassword(email: string, password: string): Customer | null {
  const customer = getCustomerByEmail(email);
  if (!customer || !customer.password) return null;
  return customer.password === password ? customer : null;
}

/** Re-verifies the current password before setting a new one (no session exists to trust instead). */
export function changeCustomerPassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<"ok" | "invalid"> {
  return withLock(() => {
    const rows = getCustomers();
    const target = rows.find((r) => r.email.toLowerCase() === email.toLowerCase());
    if (!target || target.password !== currentPassword) {
      return "invalid" as const;
    }
    target.password = newPassword;
    writeSheet(SHEETS.customers, rows);
    return "ok" as const;
  });
}

/** Admin edit — updates the editable customer fields. Rejects a duplicate email. */
export function updateCustomerByAdmin(
  customerId: string,
  patch: { name: string; email: string; phone: string; address: string }
): Promise<{ status: "ok"; customer: Customer } | { status: "not_found" } | { status: "email_taken" }> {
  return withLock(() => {
    const rows = getCustomers();
    const target = rows.find((r) => r.customerId === customerId);
    if (!target) return { status: "not_found" as const };
    const emailTaken = rows.some(
      (r) => r.customerId !== customerId && r.email.toLowerCase() === patch.email.toLowerCase()
    );
    if (emailTaken) return { status: "email_taken" as const };
    Object.assign(target, { name: patch.name, email: patch.email, phone: patch.phone, address: patch.address });
    writeSheet(SHEETS.customers, rows);
    return { status: "ok" as const, customer: target };
  });
}

/** Admin delete — removes the customer and cascades to their policies, claims, payments and documents. */
export function deleteCustomerCascade(customerId: string): Promise<"ok" | "not_found"> {
  return withLock(() => {
    const customers = getCustomers();
    if (!customers.some((c) => c.customerId === customerId)) return "not_found" as const;
    writeSheet(SHEETS.customers, customers.filter((c) => c.customerId !== customerId));

    const policies = getPolicies();
    const removedPolicyIds = new Set(
      policies.filter((p) => p.customerId === customerId).map((p) => p.policyId)
    );
    writeSheet(SHEETS.policies, policies.filter((p) => p.customerId !== customerId));

    if (removedPolicyIds.size > 0) {
      writeSheet(SHEETS.claims, getClaims().filter((c) => !removedPolicyIds.has(c.policyId)));
      writeSheet(SHEETS.payments, getPayments().filter((p) => !removedPolicyIds.has(p.policyId)));
      writeSheet(SHEETS.documents, getDocuments().filter((d) => !removedPolicyIds.has(d.policyId)));
    }
    return "ok" as const;
  });
}

export function addPolicy(p: Policy) {
  return withLock(() => {
    const rows = getPolicies();
    rows.push(p);
    writeSheet(SHEETS.policies, rows);
    return p;
  });
}

export function addClaim(c: Claim) {
  return withLock(() => {
    const rows = getClaims();
    rows.push(c);
    writeSheet(SHEETS.claims, rows);
    return c;
  });
}

export function addPayment(p: Payment) {
  return withLock(() => {
    const rows = getPayments();
    rows.push(p);
    writeSheet(SHEETS.payments, rows);
    return p;
  });
}

export function addDocument(d: DocumentRecord) {
  return withLock(() => {
    const rows = getDocuments();
    rows.push(d);
    writeSheet(SHEETS.documents, rows);
    return d;
  });
}
