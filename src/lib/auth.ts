// Terra Forest - JWT Authentication with Prisma
// Replaces mock tokenStore with real JWT + database verification

import jwt, { type SignOptions } from 'jsonwebtoken'
import { db } from './db'

// ─── Types ────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  roles: { name: string; permissions: string[] }[]
  province_id?: string | null
  organization_id?: string | null
}

export interface JwtPayload {
  userId: string
  email: string
}

// ─── Config ───────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'terra-forest-dev-secret-change-in-production-2024'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// ─── Token Generation ─────────────────────────────────────────────
export function generateToken(userId: string, email: string): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign({ userId, email }, JWT_SECRET, options);
}

// ─── Token Verification ───────────────────────────────────────────
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// ─── Get User from Authorization Header ───────────────────────────
export async function getUserFromAuth(authHeader: string | null): Promise<AuthUser | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      },
      province: true,
      organization: true,
    }
  })

  if (!user || !user.is_active) return null

  const roles = user.roles.map(ur => ({
    name: ur.role.name,
    permissions: ur.role.permissions.map(rp => rp.permission.name),
  }))

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles,
    province_id: user.province_id,
    organization_id: user.organization_id,
  }
}

// ─── Check Permission ─────────────────────────────────────────────
export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.roles.some(role => role.permissions.includes(permission))
}

// ─── Check Role ───────────────────────────────────────────────────
export function hasRole(user: AuthUser, roleName: string): boolean {
  return user.roles.some(role => role.name === roleName)
}

// ─── Response Helpers ─────────────────────────────────────────────
export function success(data: unknown, meta?: Record<string, unknown>) {
  return { data, ...(meta ? { meta } : {}) }
}

export function error(message: string, status: number = 400) {
  return { error: { message, status } }
}

export function unauthorized() {
  return { error: { message: 'Unauthorized', status: 401 } }
}

export function forbidden(message: string = 'Insufficient permissions') {
  return { error: { message, status: 403 } }
}

export function notFound(resource: string = 'Resource') {
  return { error: { message: `${resource} not found`, status: 404 } }
}
