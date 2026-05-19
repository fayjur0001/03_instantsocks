import { Request, Response } from "express";
import db from "@/db";
import { UserModel, AddedFundModel } from "@/db/schema";
import UnloggingError from "@/utils/unlogging-error";
import pusher from "@/utils/pusher";
import { and, asc, desc, eq, gte, ne, notInArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function getUsers(req: Request, res: Response) {
  try {
    const { page, limit, username, email, role, type } = z.object({
      page: z.coerce.number().int().min(1).catch(1),
      limit: z.coerce.number().int().min(1).catch(20),
      username: z.string().optional(),
      email: z.string().optional(),
      role: z.string().catch("all role"),
      type: z.string().catch("all"),
    }).parse(req.query);

    const offset = (page - 1) * limit;
    const userId = req.payload!.id;

    const query = db.select({
      id: UserModel.id,
      username: UserModel.username,
      email: UserModel.email,
      role: UserModel.role,
      lastActivity: UserModel.updatedAt,
      isOnline: UserModel.isOnline,
      isBanned: sql<boolean>`case when ${UserModel.banned} or ${UserModel.bannedTill} > now() then true else false end`.as("isBanned"),
    }).from(UserModel).where(and(
      ne(UserModel.role, "super admin"),
      ne(UserModel.id, userId),
      username ? sql`regexp_like(${UserModel.username}, ${username}, 'i')` : undefined,
      email ? sql`regexp_like(${UserModel.email}, ${email}, 'i')` : undefined,
      role === "all role" ? undefined : eq(UserModel.role, role as any),
      type === "online" ? eq(UserModel.isOnline, true) :
      type === "suspended" ? sql`${UserModel.bannedTill} > now()` :
      type === "banned" ? eq(UserModel.banned, true) : undefined,
    )).as("query");

    const [users, total] = await Promise.all([
      db.select().from(query).offset(offset).limit(limit).orderBy(desc(query.isOnline), desc(query.id), asc(query.username)),
      db.select({ total: sql<number>`count(*)::int` }).from(query).then((r) => r.at(0)?.total || 0),
    ]);

    res.json({ success: true, users, totalPage: Math.ceil(total / limit) });
  } catch (e) {
    console.error("GET USERS ERROR:", e);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function banUser(req: Request, res: Response) {
  try {
    const { id, forSevenDays } = z.object({
      id: z.coerce.number().int().min(1),
      forSevenDays: z.coerce.boolean().default(false),
    }).parse(req.body);

    await db.update(UserModel)
      .set(forSevenDays ? { bannedTill: sql`now() + '7 days'::interval` } : { banned: true })
      .where(eq(UserModel.id, id));

    await pusher({ page: "/admin-area/users", to: "admin" });
    res.json({ success: true });
  } catch (e) {
    console.error("BAN USER ERROR:", e);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function unbanUser(req: Request, res: Response) {
  try {
    const id = z.coerce.number().int().min(1).parse(req.body.id);

    await db.update(UserModel)
      .set({ banned: false, bannedTill: sql`now()` })
      .where(and(
        eq(UserModel.id, id),
        notInArray(UserModel.role, ["super admin", "admin"]),
        or(eq(UserModel.banned, true), gte(UserModel.bannedTill, new Date())),
      ));

    await pusher({ page: "/admin-area/users", to: "admin" });
    res.json({ success: true });
  } catch (e) {
    console.error("UNBAN USER ERROR:", e);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { id, password } = z.object({
      id: z.coerce.number().int().min(1),
      password: z.string().min(8),
    }).parse(req.body);

    await db.update(UserModel)
      .set({ password: bcrypt.hashSync(password, bcrypt.genSaltSync()) })
      .where(and(eq(UserModel.id, id), notInArray(UserModel.role, ["admin", "super admin"])));

    res.json({ success: true });
  } catch (e) {
    console.error("CHANGE PASSWORD ERROR:", e);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function changeRole(req: Request, res: Response) {
  try {
    const { id, role } = z.object({
      id: z.coerce.number().int().min(1),
      role: z.enum(["general", "support", "admin"]),
    }).parse(req.body);

    await db.update(UserModel)
      .set({ role })
      .where(and(eq(UserModel.id, id), notInArray(UserModel.role, ["admin", "super admin"])));

    await pusher({ page: "/admin-area/users", to: "admin" });
    res.json({ success: true });
  } catch (e) {
    console.error("CHANGE ROLE ERROR:", e);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function addBalance(req: Request, res: Response) {
  try {
    const { id } = z.object({
      id: z.coerce.number().int().min(1),
    }).parse(req.params);

    const { amount, currency, walletAddress, txid } = z.object({
      amount: z.number().positive(),
      currency: z.string().min(1),
      walletAddress: z.string().min(1),
      txid: z.string().optional(),
    }).parse(req.body);

    const user = await db.query.UserModel.findFirst({
      where: (m, { eq }) => eq(m.id, id),
      columns: { id: true },
    });

    if (!user) throw new UnloggingError("User not found.");

    await db.insert(AddedFundModel).values({
      userId: id,
      amount,
      currency,
      walletAddress,
      txid: txid ?? null,
      status: "approved",
      method: "now_payments",
      manualyUploaded: true,
    });

    await Promise.all([
      pusher({ page: "/admin-area/users", to: "admin" }),
      pusher({ page: "/admin-area/transactions", to: "admin" }),
      pusher({ page: "/top-up/transactions", to: `user-${id}` }),
      pusher({ page: "/header/user", to: `user-${id}` }),
    ]);

    res.json({ success: true });
  } catch (e) {
    console.error("ADD BALANCE ERROR:", e);
    if (e instanceof UnloggingError) {
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function editUser(req: Request, res: Response) {
  try {
    const { id, username, email } = z.object({
      id: z.coerce.number().int().min(1),
      username: z.string().min(1),
      email: z.string().email(),
    }).parse(req.body);

    const updated = await db.update(UserModel)
      .set({ username, email })
      .where(and(eq(UserModel.id, id), notInArray(UserModel.role, ["super admin", "admin"])))
      .returning({ id: UserModel.id })
      .then((r) => r.at(0));

    if (!updated) throw new UnloggingError("User not found.");

    await pusher({ page: "/admin-area/users", to: "admin" });
    await pusher({ page: "/header/user", to: `user-${updated.id}` });

    res.json({ success: true });
  } catch (e) {
    console.error("EDIT USER ERROR:", e);
    if (e instanceof UnloggingError) {
      res.status(400).json({ success: false, message: e.message });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// GET /api/admin/transactions — all users' deposit transactions (admin only)
export async function getAllTransactions(req: Request, res: Response) {
  try {
    const { page, limit, status, userId } = z.object({
      page: z.coerce.number().int().min(1).catch(1),
      limit: z.coerce.number().int().min(1).max(100).catch(20),
      status: z.enum(["pending", "approved", "rejected", "all"]).catch("all"),
      userId: z.coerce.number().int().min(1).optional(),
    }).parse(req.query);

    const offset = (page - 1) * limit;

    const where = and(
      userId ? eq(AddedFundModel.userId, userId) : undefined,
      status !== "all" ? eq(AddedFundModel.status, status) : undefined,
    );

    const [transactions, totalRows] = await Promise.all([
      db
        .select({
          id: AddedFundModel.id,
          date: AddedFundModel.createdAt,
          wallet: AddedFundModel.currency,
          walletAddress: AddedFundModel.walletAddress,
          txnId: AddedFundModel.txid,
          amount: AddedFundModel.amount,
          status: AddedFundModel.status,
          method: AddedFundModel.method,
          manuallyUploaded: AddedFundModel.manualyUploaded,
          userId: AddedFundModel.userId,
          username: UserModel.username,
        })
        .from(AddedFundModel)
        .leftJoin(UserModel, eq(AddedFundModel.userId, UserModel.id))
        .where(where)
        .orderBy(desc(AddedFundModel.id))
        .offset(offset)
        .limit(limit),

      db
        .select({ total: sql<number>`count(*)::int` })
        .from(AddedFundModel)
        .where(where)
        .then((r) => r.at(0)?.total ?? 0),
    ]);

    res.json({
      success: true,
      transactions,
      totalPage: Math.ceil(totalRows / limit),
      total: totalRows,
    });
  } catch (e) {
    console.error("GET ALL TRANSACTIONS ERROR:", e);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}