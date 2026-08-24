import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";

const HOUSEHOLD_COOKIE = "bl_rsvp_household";
const MAX_AGE_SECONDS = 60 * 60 * 6;

function sessionSecret(): string {
  return (
    process.env.RSVP_SESSION_SECRET ||
    process.env.WEDDING_ADMIN_SESSION_SECRET ||
    process.env.WEDDING_ADMIN_PASSWORD ||
    "dev-rsvp-secret"
  );
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

export function hashInvitationCode(code: string): string {
  return createHash("sha256")
    .update(`${sessionSecret()}:invite:${code.trim().toUpperCase()}`)
    .digest("hex");
}

export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${sessionSecret()}:ip:${ip}`).digest("hex");
}

export function createConfirmationToken(householdId: string): string {
  const nonce = randomBytes(8).toString("hex");
  const payload = `${householdId}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyConfirmationToken(
  token: string,
  householdId: string,
): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [id, nonce, signature] = parts;
  if (id !== householdId || !nonce || !signature) return false;
  const payload = `${id}.${nonce}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createHouseholdSessionValue(householdId: string): string {
  const issuedAt = Date.now().toString();
  const payload = `${householdId}.${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

export function parseHouseholdSession(
  token: string | undefined,
): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [householdId, issuedAt, signature] = parts;
  if (!householdId || !issuedAt || !signature) return null;
  const payload = `${householdId}.${issuedAt}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_SECONDS * 1000) {
    return null;
  }
  return householdId;
}

export { HOUSEHOLD_COOKIE, MAX_AGE_SECONDS as HOUSEHOLD_SESSION_MAX_AGE };
