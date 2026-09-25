import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hasPermission, isStoreStaff, type AdminPermission } from "@/lib/permissions";

const SESSION_COOKIE = "duka_session";
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  role: "customer" | "staff" | "admin";
  name: string;
  email: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  return user ?? null;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("You need to sign in first", 401);
  return user;
}

/** Exact admin role only. Use for anything that manages the team itself. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new AuthError("Admins only", 403);
  }
  return user;
}

/**
 * Admin, or staff with that specific section switched on. Throws — use
 * this inside "use server" actions, which is where the real enforcement
 * lives (the page-level checks below are what keep the UI honest, this is
 * the backstop).
 */
export async function requirePermission(perm: AdminPermission) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, perm)) {
    throw new AuthError("You don't have permission to do that", 403);
  }
  return user;
}

/** Page-level guard for admin-only routes (e.g. team management). Redirects instead of throwing. */
export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/admin");
  return user;
}

/** Page-level guard for a specific admin section. Redirects instead of throwing. */
export async function requireAdminPagePermission(perm: AdminPermission) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isStoreStaff(user)) redirect("/");
  if (!hasPermission(user, perm)) redirect("/admin");
  return user;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
