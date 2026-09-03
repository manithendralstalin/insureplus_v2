import "server-only";
import { DatabaseSync } from "node:sqlite";

/** In-memory SQLite database used by the /api/search endpoint. */
let db: DatabaseSync | null = null;

function init(): DatabaseSync {
  const d = new DatabaseSync(":memory:");
  d.exec(`
    CREATE TABLE customers (
      id       TEXT,
      name     TEXT,
      email    TEXT,
      password TEXT,
      city     TEXT
    );
    CREATE TABLE policies (
      policyId   TEXT,
      policyName TEXT,
      category   TEXT,
      premium    INTEGER
    );

    INSERT INTO customers VALUES
      ('CUST-0001', 'Aarav Sharma', 'aarav.sharma@example.com', 'Demo@1234',  'Mumbai'),
      ('CUST-0002', 'Diya Nair',    'diya.nair@example.com',    'Demo@1234',  'Bengaluru'),
      ('ADMIN-0001','System Admin',  'admin@insureplus.com',     'Admin@1234', 'HQ');

    INSERT INTO policies VALUES
      ('POL-2026-00001', 'Health Shield Elite',        'Health', 1499),
      ('POL-2026-00002', 'Motor Secure Comprehensive', 'Motor',  583),
      ('POL-2026-00003', 'Life Secure Term Plan',      'Life',   999),
      ('POL-2026-00004', 'Travel Safe Global',         'Travel', 349),
      ('POL-2026-00005', 'Home Guard Plus',            'Home',   799);
  `);
  return d;
}

function getDb(): DatabaseSync {
  if (!db) db = init();
  return db;
}

/** Runs a SQL string and returns all rows. */
export function rawAll(sql: string): unknown[] {
  return getDb().prepare(sql).all();
}
