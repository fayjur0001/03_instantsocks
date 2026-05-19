import { AdditionalUserInformationModel } from "@/db/schema";
import { PasswordResetRequestModel } from "@/db/schema";
import { sendPasswordResetEmail } from "@/utils/mailer";
import { Request, Response } from "express";
import {
  setAuthCookie,
  clearAuthCookie,
} from "@/middleware/auth.middleware";

import db from "@/db";

import {
  UserModel,
  UserDeviceModel,
  TicketModel,
  TicketMessageModel,
  TicketMessageSeenByModel,
} from "@/db/schema";

import UnloggingError from "@/utils/unlogging-error";

import {
  and,
  eq,
  isNull,
  notInArray,
  or,
  sql,
} from "drizzle-orm";

import { z } from "zod";

import bcrypt from "bcryptjs";

import crypto from "crypto";

import Payload from "@/types/payload.type";

import getBalance from "@/utils/get-balance";

function getBadge(role: string) {
  switch (role) {
    case "super admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "support":
      return "Support";
    default:
      return "Basic User";
  }
}

// ── REGISTER ─────────────────────────────────────────────────────
export async function register(
  req: Request,
  res: Response
) {
  try {
    const { username, email, password, pin } = req.body;

    if (!username || !email || !password || !pin) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await db.query.UserModel.findFirst({
      where: (m) => or(eq(m.username, username), eq(m.email, email))
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const users = await db.select().from(UserModel);
    const role = users.length === 0 ? "super admin" : "general";

    await db.insert(UserModel).values({
      username,
      email,
      password: hashedPassword,
      role,
    });

    return res.json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// ── LOGIN ─────────────────────────────────────────────────────────
export async function login(
  req: Request,
  res: Response
) {
  try {
    const { username, password, rememberMe } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await db.query.UserModel.findFirst({
      where: (m) => or(eq(m.username, username), eq(m.email, username)),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    if (user.banned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
      });
    }

    const deviceToken = crypto.randomBytes(32).toString("hex");

    await db.insert(UserDeviceModel).values({
      userId: user.id,
      token: deviceToken,
    });

    const payload: Payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      deviceToken: deviceToken,
    };

    setAuthCookie(res, payload, rememberMe ? 30 : 0);

    return res.json({
      success: true,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// ── LOGOUT ───────────────────────────────────────────────────────
export async function logout(
  req: Request,
  res: Response
) {
  try {
    if (req.token)
      await db
        .delete(UserDeviceModel)
        .where(eq(UserDeviceModel.token, req.token));

    clearAuthCookie(res);

    res.json({ success: true });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ── ME (B1 — AdditionalUserInfo সহ) ──────────────────────────────
export async function me(
  req: Request,
  res: Response
) {
  try {
    const p = req.payload!;

    const [user, additionalInfo] = await Promise.all([
      db.query.UserModel.findFirst({
        where: (m, { eq }) => eq(m.id, p.id),
        columns: { email: true },
      }),
      db.query.AdditionalUserInformationModel.findFirst({
        where: (m, { eq }) => eq(m.userId, p.id),
      }),
    ]);

    return res.json({
      success: true,
      user: {
        id: p.id,
        username: p.username,
        badge: getBadge(p.role),
        role: p.role,
        email: user?.email || "",
        firstName: additionalInfo?.firstName || "",
        nickName: additionalInfo?.nickName || "",
        lastName: additionalInfo?.lastName || "",
        website: additionalInfo?.website || "",
        telegram: additionalInfo?.telegram || "",
        jabber: additionalInfo?.jabber || "",
        bio: additionalInfo?.bio || "",
        avatar: additionalInfo?.profilePicture || "",
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ── BALANCE ──────────────────────────────────────────────────────
export async function getUserBalance(
  req: Request,
  res: Response
) {
  try {
    const balance = await getBalance(req.payload!.id);
    res.json({ success: true, balance });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ── NOTIFICATIONS COUNT ──────────────────────────────────────────
export async function getNotificationCount(
  req: Request,
  res: Response
) {
  try {
    const { id: userId, role } = req.payload!;

    const [opened, unread] = await Promise.all([
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(TicketModel)
        .where(
          and(
            or(
              eq(TicketModel.agentId, userId),
              eq(TicketModel.userId, userId),
              ["admin", "super admin", "support"].includes(role)
                ? isNull(TicketModel.agentId)
                : undefined
            ),
            eq(TicketModel.status, "opened")
          )
        )
        .then((r) => r.at(0)?.total || 0),

      db
        .select({ total: sql<number>`count(*)::int` })
        .from(TicketModel)
        .leftJoin(
          TicketMessageModel,
          eq(TicketMessageModel.ticketId, TicketModel.id)
        )
        .leftJoin(
          TicketMessageSeenByModel,
          and(
            eq(TicketMessageSeenByModel.messageId, TicketMessageModel.id),
            eq(TicketMessageSeenByModel.userId, userId)
          )
        )
        .where(
          and(
            or(
              eq(TicketModel.agentId, userId),
              eq(TicketModel.userId, userId)
            ),
            isNull(TicketMessageSeenByModel.id),
            eq(TicketModel.status, "opened")
          )
        )
        .then((r) => r.at(0)?.total || 0),
    ]);

    res.json({ success: true, count: opened + unread });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ── LOGIN AS ─────────────────────────────────────────────────────
export async function loginAs(
  req: Request,
  res: Response
) {
  try {
    const id = z.coerce.number().int().min(1).parse(req.body.id);

    const user = await db
      .select({
        id: UserModel.id,
        role: UserModel.role,
        username: UserModel.username,
      })
      .from(UserModel)
      .where(
        and(
          eq(UserModel.id, id),
          notInArray(UserModel.role, ["admin", "super admin"])
        )
      )
      .limit(1)
      .then((r) => r.at(0));

    if (!user) throw new UnloggingError("User not found.");

    setAuthCookie(res, {
      isShadowAdmin: true,
      role: user.role,
      id: user.id,
      username: user.username,
    });

    res.json({ success: true });
  } catch (e) {
    if (e instanceof UnloggingError) {
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ── FORGOT PASSWORD ──────────────────────────────────────────────
export async function forgotPassword(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await db.query.UserModel.findFirst({
      where: (m, { eq }) => eq(m.email, email),
      columns: { id: true, email: true },
    });

    if (user) {
      const selector = crypto.randomBytes(20).toString("hex");
      const rawToken = crypto.randomBytes(40).toString("hex");
      const hashedToken = await bcrypt.hash(rawToken, 10);

      await db
        .delete(PasswordResetRequestModel)
        .where(eq(PasswordResetRequestModel.email, email));

      await db.insert(PasswordResetRequestModel).values({
        email,
        selector,
        token: hashedToken,
      });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const resetLink = `${clientUrl}/reset-password?selector=${selector}&token=${rawToken}`;

      try {
        await sendPasswordResetEmail(email, resetLink);
      } catch (err) {
        console.error("Email send failed:", err);
      }
    }

    return res.json({
      success: true,
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// ── RESET PASSWORD ───────────────────────────────────────────────
export async function resetPassword(
  req: Request,
  res: Response
) {
  try {
    const { selector, token, newPassword } = req.body;

    if (!selector || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "selector, token and newPassword are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const resetRequest =
      await db.query.PasswordResetRequestModel.findFirst({
        where: (m, { eq, and, gt }) =>
          and(
            eq(m.selector, selector),
            gt(m.createdAt, new Date(Date.now() - 60 * 60 * 1000))
          ),
      });

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    const tokenValid = await bcrypt.compare(token, resetRequest.token);

    if (!tokenValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    const user = await db.query.UserModel.findFirst({
      where: (m, { eq }) => eq(m.email, resetRequest.email),
      columns: { id: true, email: true },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await db
      .update(UserModel)
      .set({ password: hashedPassword })
      .where(eq(UserModel.email, resetRequest.email))
      .returning({ id: UserModel.id });

    if (!updated || updated.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Password update failed",
      });
    }

    await db
      .delete(PasswordResetRequestModel)
      .where(eq(PasswordResetRequestModel.selector, selector));

    await db
      .delete(UserDeviceModel)
      .where(eq(UserDeviceModel.userId, user.id));

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// ── GET PROFILE (B1) ─────────────────────────────────────────────
export async function getProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.payload!.id;

    const [user, additionalInfo] = await Promise.all([
      db.query.UserModel.findFirst({
        where: (m, { eq }) => eq(m.id, userId),
        columns: {
          id: true,
          username: true,
          email: true,
          role: true,
          isOnline: true,
          banned: true,
          createdAt: true,
        },
      }),
      db.query.AdditionalUserInformationModel.findFirst({
        where: (m, { eq }) => eq(m.userId, userId),
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
        firstName: additionalInfo?.firstName || "",
        nickName: additionalInfo?.nickName || "",
        lastName: additionalInfo?.lastName || "",
        website: additionalInfo?.website || "",
        telegram: additionalInfo?.telegram || "",
        jabber: additionalInfo?.jabber || "",
        bio: additionalInfo?.bio || "",
        avatar: additionalInfo?.profilePicture || "",
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ── UPDATE PROFILE (B1) ──────────────────────────────────────────
export async function updateProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.payload!.id;

    const schema = z.object({
      username: z
        .string()
        .min(3, "Username min 3 chars")
        .max(30, "Username max 30 chars")
        .regex(/^[a-zA-Z0-9_]+$/, "Username: only letters, numbers, underscore")
        .optional(),
      firstName: z.string().max(50).optional(),
      lastName:  z.string().max(50).optional(),
      nickName:  z.string().max(50).optional(),
      website:   z.string().max(200).optional(),
      telegram:  z.string().max(100).optional(),
      jabber:    z.string().max(100).optional(),
      bio:       z.string().max(500).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || "Invalid input",
      });
    }

    const { username, firstName, lastName, nickName, website, telegram, jabber, bio } =
      parsed.data;

    // Username change — unique check
    if (username) {
      const existing = await db.query.UserModel.findFirst({
        where: (m, { eq, and, ne }) =>
          and(eq(m.username, username), ne(m.id, userId)),
        columns: { id: true },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Username already taken.",
        });
      }
      await db
        .update(UserModel)
        .set({ username })
        .where(eq(UserModel.id, userId));
    }

    // AdditionalUserInformation — upsert
    const additionalData = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName  !== undefined && { lastName }),
      ...(nickName  !== undefined && { nickName }),
      ...(website   !== undefined && { website }),
      ...(telegram  !== undefined && { telegram }),
      ...(jabber    !== undefined && { jabber }),
      ...(bio       !== undefined && { bio }),
    };

    if (Object.keys(additionalData).length > 0) {
      const existingInfo =
        await db.query.AdditionalUserInformationModel.findFirst({
          where: (m, { eq }) => eq(m.userId, userId),
          columns: { id: true },
        });

      if (existingInfo) {
        await db
          .update(AdditionalUserInformationModel)
          .set(additionalData)
          .where(eq(AdditionalUserInformationModel.userId, userId));
      } else {
        await db.insert(AdditionalUserInformationModel).values({
          userId,
          ...additionalData,
        });
      }
    }

    return res.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ── CHANGE PASSWORD (B2) ─────────────────────────────────────────
export async function changePassword(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const { oldPassword, newPassword } = z.object({
      oldPassword: z.string().min(1, "Old password required"),
      newPassword: z.string().min(8, "New password min 8 chars"),
    }).parse(req.body);

    const user = await db.query.UserModel.findFirst({
      where: (m, { eq }) => eq(m.id, userId),
      columns: { password: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.update(UserModel).set({ password: hashed }).where(eq(UserModel.id, userId));

    return res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0]?.message });
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ── CHANGE PIN (B2) ──────────────────────────────────────────────
export async function changePin(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const { oldPin, newPin } = z.object({
      oldPin: z.string().optional(),   // first time set হলে oldPin নাও থাকতে পারে
      newPin: z.string().length(6, "PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must be numeric"),
    }).parse(req.body);

    const user = await db.query.UserModel.findFirst({
      where: (m, { eq }) => eq(m.id, userId),
      columns: { pinCode: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // PIN already set আছে → old pin verify করতে হবে
    if (user.pinCode) {
      if (!oldPin) {
        return res.status(400).json({ success: false, message: "Old PIN required." });
      }
      const isMatch = await bcrypt.compare(oldPin, user.pinCode);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Old PIN is incorrect." });
      }
    }

    const hashedPin = await bcrypt.hash(newPin, 10);
    await db.update(UserModel).set({ pinCode: hashedPin }).where(eq(UserModel.id, userId));

    return res.json({ success: true, message: "PIN changed successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0]?.message });
    }
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}