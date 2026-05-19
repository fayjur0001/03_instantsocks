import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "@/db";
import Payload from "@/types/payload.type";
import { Role } from "@/types/role.type";

// 🔥 SAFE COOKIE NAME (fallback added)
const tokenName = `${process.env.TOKEN_NAME_SALT || "auth"}-token`;

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      payload?: Payload;
      token?: string;
    }
  }
}

// ─────────────────────────────────────────────
// GET TOKEN FROM COOKIE
// ─────────────────────────────────────────────
export function getTokenFromRequest(req: Request): string | null {
  const token = req.cookies?.[tokenName];
  return token ? String(token) : null;
}

// ─────────────────────────────────────────────
// VERIFY JWT
// ─────────────────────────────────────────────
export function getPayloadFromToken(token: string): Payload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as Payload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// AUTO ATTACH AUTH (optional middleware)
// ─────────────────────────────────────────────
export function attachAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = getTokenFromRequest(req);

  if (token) {
    req.token = token;

    const payload = getPayloadFromToken(token);
    if (payload) req.payload = payload;
  }

  next();
}

// ─────────────────────────────────────────────
// PROTECTED ROUTE MIDDLEWARE
// ─────────────────────────────────────────────
export function requireAuth(acceptedRoles: Role[] = []) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized (no token).",
      });
    }

    const payload = getPayloadFromToken(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized (invalid token).",
      });
    }

    const user = await db.query.UserModel.findFirst({
      where: (m, { eq, and }) =>
        and(
          eq(m.id, payload.id),
          eq(m.role, payload.role),
          eq(m.username, payload.username)
        ),
      columns: { id: true, username: true, role: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized (user not found).",
      });
    }

    // Device validation
    if (!payload.isShadowAdmin) {
      const device = await db.query.UserDeviceModel.findFirst({
        where: (m, { eq, and }) =>
          and(
            eq(m.userId, payload.id),
            eq(m.token, payload.deviceToken!)
          ),
        columns: { id: true },
      });

      if (!device) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized (invalid device).",
        });
      }
    }

    // Role check
    if (acceptedRoles.length > 0 && !acceptedRoles.includes(payload.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden.",
      });
    }

    req.payload = payload;
    req.token = token;

    next();
  };
}

// ─────────────────────────────────────────────
// SET COOKIE (FIXED)
// ─────────────────────────────────────────────
export function setAuthCookie(
  res: Response,
  payload: Payload,
  days = 0
): string {
  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  res.cookie(tokenName, token, {
    httpOnly: true,
    secure: false, // ⚠️ LOCALHOST = MUST FALSE
    sameSite: "lax",
    path: "/",
    maxAge: days
      ? days * 24 * 60 * 60 * 1000
      : undefined,
  });

  return token;
}

// ─────────────────────────────────────────────
// CLEAR COOKIE
// ─────────────────────────────────────────────
export function clearAuthCookie(res: Response) {
  res.clearCookie(tokenName, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
}