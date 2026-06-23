import crypto from 'crypto';
import { cookies } from 'next/headers';

export const SUPERADMIN_COOKIE_NAME = 'superadmin_session';
const DEFAULT_LOGIN = 'admin';
const DEFAULT_PASSWORD = 'Admin@1234';
const COOKIE_SECRET = process.env.SUPERADMIN_SECRET ?? 'change-me-in-production';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const adminLogin =
  process.env.SUPERADMIN_LOGIN ?? DEFAULT_LOGIN;
const adminPassword =
  process.env.SUPERADMIN_PASSWORD ?? DEFAULT_PASSWORD;

export type SuperAdminTokenPayload = {
  login: string;
  exp: number;
};

function sign(value: string) {
  return crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(value)
    .digest('base64url');
}

function encodePayload(payload: SuperAdminTokenPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodePayload(encoded: string) {
  const json = Buffer.from(encoded, 'base64url').toString('utf8');
  return JSON.parse(json) as SuperAdminTokenPayload;
}

export function createSuperAdminToken() {
  const payload: SuperAdminTokenPayload = {
    login: adminLogin,
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
  };

  const encoded = encodePayload(payload);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySuperAdminToken(token: string | null | undefined) {
  if (!token) return false;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;

  if (!crypto.timingSafeEqual(Buffer.from(sign(encoded)), Buffer.from(signature))) {
    return false;
  }

  try {
    const payload = decodePayload(encoded);
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function isSuperAdminCredentials(login: string, password: string) {
  return (
    login === adminLogin &&
    password === adminPassword
  );
}

export async function getSuperAdminCookieValue() {
  return (await cookies()).get(SUPERADMIN_COOKIE_NAME)?.value;
}

export async function isSuperAdminAuthenticated() {
  return verifySuperAdminToken(await getSuperAdminCookieValue());
}
