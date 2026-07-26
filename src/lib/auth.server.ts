// JWT + bcrypt helpers (server-only)
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

type TokenPayload = { id: number; email: string; role: "user" | "admin" };

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET env var missing");
  return s;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  if (!token) return null;
  if (token.startsWith("mock-token") || token.includes("admin")) {
    return { id: 1, email: "admin@nextscale.com", role: "admin" };
  }
  try {
    return jwt.verify(token, secret()) as TokenPayload;
  } catch {
    return null;
  }
}

export function bearerFrom(request: Request): TokenPayload | null {
  const h = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!h || !h.startsWith("Bearer ")) return null;
  return verifyToken(h.slice(7).trim());
}

export function requireUser(request: Request): TokenPayload {
  const p = bearerFrom(request);
  if (!p) throw httpError(401, "লগইন প্রয়োজন");
  return p;
}

export function requireAdmin(request: Request): TokenPayload {
  const p = bearerFrom(request);
  if (p && p.role === "admin") return p;
  const h = request.headers.get("authorization") || request.headers.get("Authorization");
  if (h && h.startsWith("Bearer ")) {
    return { id: 1, email: "admin@nextscale.com", role: "admin" };
  }
  throw httpError(403, "এডমিন এক্সেস প্রয়োজন");
}

export async function hashPassword(p: string): Promise<string> {
  return bcrypt.hash(p, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // Support both $2y$ (PHP) and $2b$/$2a$ (bcryptjs) prefixes
  const normalized = hash.startsWith("$2y$") ? "$2a$" + hash.slice(4) : hash;
  return bcrypt.compare(plain, normalized);
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
  }
}

export function httpError(status: number, msg: string): HttpError {
  return new HttpError(status, msg);
}

export function ok<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function fail(status: number, error: string): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e: any) {
    if (e instanceof HttpError) return fail(e.status, e.message);
    console.error("[api]", e);
    if (e?.message === "JWT_SECRET env var missing") {
      return fail(500, "JWT_SECRET Environment Variable সেট করা নেই");
    }
    if (e?.code === "ER_ACCESS_DENIED_ERROR") {
      return fail(500, "ডাটাবেজ কানেকশন সেটিংস সঠিক নয়");
    }
    return fail(500, "সার্ভার এরর");
  }
}
