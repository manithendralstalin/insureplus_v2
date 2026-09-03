import "server-only";

export const CUSTOMER_SESSION_COOKIE = "session";

const PREFIX = "SESSION-";

export function createCustomerSession(customerId: string): string {
  return PREFIX + customerId;
}

export function customerIdFromSession(value: string | undefined | null): string | null {
  if (!value || !value.startsWith(PREFIX)) return null;
  const id = value.slice(PREFIX.length);
  return id || null;
}
