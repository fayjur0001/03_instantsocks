import { Request, Response } from "express";
import db from "@/db";
import { AddedFundModel, UserModel } from "@/db/schema";
import UnloggingError from "@/utils/unlogging-error";
import pusher from "@/utils/pusher";
import SiteOptions from "@/utils/site-options";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { paymentExpireTime, nowPaymentsApiUrl } from "@/utils/constants";

// GET /api/topup/last-funds
export async function getLastFunds(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const lastFunds = await db.query.AddedFundModel.findMany({
      where: (m, { eq, and, sql }) =>
        and(
          eq(m.userId, userId),
          eq(m.status, "pending"),
          sql`${m.createdAt} + ${paymentExpireTime + " ms"}::interval > now()`
        ),

      orderBy: (m, { desc }) => desc(m.createdAt),

      columns: {
        amount: true,
        currency: true,
        walletAddress: true,
      },
    });

    res.json({
      success: true,
      lastFunds,
    });
  } catch (e) {
    console.error("GET LAST FUNDS ERROR:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// GET /api/topup/transactions  (user — নিজের history)
export async function getTopupTransactions(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const transactions = await db
      .select({
        id: AddedFundModel.id,
        date: AddedFundModel.createdAt,
        wallet: AddedFundModel.currency,
        walletAddress: AddedFundModel.walletAddress,
        txnId: AddedFundModel.txid,
        amount: AddedFundModel.amount,

        status: sql<string>`case
          when ${AddedFundModel.status} != 'pending' then ${AddedFundModel.status}
          when ${AddedFundModel.createdAt} + ${paymentExpireTime + " ms"}::interval > now() then 'pending'
          else 'rejected'
        end`,
      })
      .from(AddedFundModel)
      .where(eq(AddedFundModel.userId, userId))
      .orderBy(desc(AddedFundModel.createdAt));

    res.json({
      success: true,
      transactions,
    });
  } catch (e) {
    console.error("GET TRANSACTIONS ERROR:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// ── GET /api/topup/admin/transactions  (admin — সব users এর transactions) ──
export async function getAdminTransactions(req: Request, res: Response) {
  try {
    const transactions = await db
      .select({
        id: AddedFundModel.id,
        date: AddedFundModel.createdAt,
        userId: AddedFundModel.userId,
        username: UserModel.username,
        wallet: AddedFundModel.currency,
        walletAddress: AddedFundModel.walletAddress,
        txnId: AddedFundModel.txid,
        amount: AddedFundModel.amount,
        status: AddedFundModel.status,
        method: AddedFundModel.method,
        manuallyUploaded: AddedFundModel.manualyUploaded,
      })
      .from(AddedFundModel)
      .leftJoin(UserModel, eq(AddedFundModel.userId, UserModel.id))
      .orderBy(desc(AddedFundModel.createdAt));

    res.json({ success: true, transactions });
  } catch (e) {
    console.error("GET ADMIN TRANSACTIONS ERROR:", e);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ── POST /api/topup/admin/transactions  (manual transaction create) ────────
export async function createAdminTransaction(req: Request, res: Response) {
  try {
    const { userId, amount, currency, walletAddress, txid, status } = z
      .object({
        userId: z.number().int().positive(),
        amount: z.number().positive(),
        currency: z.string().min(1),
        walletAddress: z.string().min(1),
        txid: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).default("approved"),
      })
      .parse(req.body);

    const [newTx] = await db
      .insert(AddedFundModel)
      .values({
        userId,
        amount,
        currency,
        walletAddress,
        txid: txid ?? null,
        status,
        method: "now_payments",
        manualyUploaded: true,
      })
      .returning();

    await Promise.all([
      pusher({ page: "/admin-panel/transactions", to: "admin" }),
      pusher({ page: "/admin-area/dashboard/fund/info/pending", to: "admin" }),
      pusher({ page: "/top-up/transactions", to: `user-${userId}` }),
    ]);

    res.json({ success: true, transaction: newTx });
  } catch (e) {
    console.error("CREATE ADMIN TRANSACTION ERROR:", e);

    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: e.errors[0].message });
    }

    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ── PUT /api/topup/admin/transactions/:id  (transaction edit) ──────────────
export async function updateAdminTransaction(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid transaction ID." });
    }

    const { amount, currency, walletAddress, txid, status } = z
      .object({
        amount: z.number().positive().optional(),
        currency: z.string().min(1).optional(),
        walletAddress: z.string().min(1).optional(),
        txid: z.string().nullable().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
      })
      .parse(req.body);

    const updateData: Partial<typeof AddedFundModel.$inferInsert> = {};
    if (amount !== undefined) updateData.amount = amount;
    if (currency !== undefined) updateData.currency = currency;
    if (walletAddress !== undefined) updateData.walletAddress = walletAddress;
    if (txid !== undefined) updateData.txid = txid;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update." });
    }

    const [updated] = await db
      .update(AddedFundModel)
      .set(updateData)
      .where(eq(AddedFundModel.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    res.json({ success: true, transaction: updated });
  } catch (e) {
    console.error("UPDATE TRANSACTION ERROR:", e);

    if (e instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: e.errors[0].message });
    }

    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ── DELETE /api/topup/admin/transactions/:id  (transaction delete) ─────────
export async function deleteAdminTransaction(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid transaction ID." });
    }

    const [deleted] = await db
      .delete(AddedFundModel)
      .where(eq(AddedFundModel.id, id))
      .returning({ id: AddedFundModel.id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Transaction not found." });
    }

    res.json({ success: true, deletedId: deleted.id });
  } catch (e) {
    console.error("DELETE TRANSACTION ERROR:", e);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// POST /api/topup/now-payments
export async function generateNowPayments(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const { crypto, amount } = z
      .object({
        crypto: z.string().min(1),
        amount: z.number().positive(),
      })
      .parse(req.body);

    const [apiKey, hostUrl, secret] = await Promise.all([
      SiteOptions.payment.nowPayments.apiKey.get(),
      SiteOptions.hostUrl.get(),
      SiteOptions.payment.nowPayments.callbackSecret.get(),
    ]);

    if (!apiKey) {
      throw new UnloggingError("NowPayments API key is not configured.");
    }

    if (!hostUrl) {
      throw new UnloggingError("Host URL is not configured.");
    }

    const callback = new URL(`${hostUrl}/api/topup/callback`);
    callback.searchParams.append("secret", secret);
    callback.searchParams.append("method", "now-payments");

    const res2: any = await fetch(`${nowPaymentsApiUrl}/payment`, {
      method: "POST",

      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        price_amount: (10 / 100) * amount + amount,
        price_currency: "usd",
        pay_currency: crypto,
        ipn_callback_url: callback.toString(),
        payout_currency: crypto,

        ...(process.env.NODE_ENV === "development"
          ? { case: "partially_paid" }
          : {}),
      }),
    }).then((r) => r.json());

    console.log("NowPayments API response:", JSON.stringify(res2));

    if (res2.statusCode && res2.statusCode !== 200) {
      throw new UnloggingError(
        res2.message ?? "NowPayments API returned an error."
      );
    }

    if (!res2.pay_address) {
      throw new UnloggingError(
        "NowPayments did not return a wallet address. Check your API key."
      );
    }

    await db.insert(AddedFundModel).values({
      amount,
      userId,
      walletAddress: res2.pay_address,
      currency: crypto,
      method: "now_payments",
    });

    await Promise.all([
      pusher({ page: "/admin-panel/transactions", to: "admin" }),
      pusher({ page: "/top-up/generate/options", to: `user-${userId}` }),
      pusher({ page: "/top-up/last-fund", to: `user-${userId}` }),
      pusher({ page: "/top-up/transactions", to: `user-${userId}` }),
      pusher({ page: "/admin-area/dashboard/fund/info/pending", to: "admin" }),
      pusher({ page: "/top-up", to: `user-${userId}` }),
    ]);

    res.json({
      success: true,
      payment: res2,
    });
  } catch (e) {
    console.error("NOW PAYMENTS ERROR:", e);

    if (e instanceof UnloggingError) {
      res.status(400).json({
        success: false,
        message: e.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// POST /api/topup/shkeeper
export async function generateShkeeper(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const { crypto, amount } = z
      .object({
        crypto: z.string().min(1),
        amount: z.number().positive(),
      })
      .parse(req.body);

    if (!process.env.SHKEEPER_URL) {
      throw new UnloggingError("SHKEEPER_URL is not set in environment.");
    }

    if (!process.env.SHKEEPER_CALLBACK_SECRET) {
      throw new UnloggingError(
        "SHKEEPER_CALLBACK_SECRET is not set in environment."
      );
    }

    await db.transaction(async (tx) => {
      const [fundId, apiKey, host] = await Promise.all([
        tx
          .insert(AddedFundModel)
          .values({
            amount,
            userId,
            walletAddress: "",
            method: "shkeeper",
            status: "pending",
            currency: crypto,
          })
          .returning({ id: AddedFundModel.id })
          .then((r) => r.at(0)?.id),

        SiteOptions.payment.shkeeper.apiKey.get(),
        SiteOptions.hostUrl.get(),
      ]);

      if (!host) {
        throw new UnloggingError("Host URL is not configured.");
      }

      const secret = process.env.SHKEEPER_CALLBACK_SECRET;

      if (!fundId || !secret) {
        return tx.rollback();
      }

      const callbackURL = new URL(`${host}/api/topup/callback`);
      callbackURL.searchParams.set("method", "shkeeper");
      callbackURL.searchParams.set("secret", secret);

      const r: any = await fetch(
        `${process.env.SHKEEPER_URL}/api/v1/${crypto}/payment_request`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "X-Shkeeper-Api-Key": apiKey,
          },

          body: JSON.stringify({
            external_id: fundId,
            fiat: "USD",
            amount: amount.toString(),
            callback_url: callbackURL.toString(),
          }),
        }
      ).then((r) => r.json());

      console.log("Shkeeper API response:", JSON.stringify(r));

      if (r.status !== "success") {
        return tx.rollback();
      }

      await tx
        .update(AddedFundModel)
        .set({ walletAddress: r.wallet })
        .where(eq(AddedFundModel.id, fundId));
    });

    await Promise.all([
      pusher({ page: "/top-up/last-fund", to: `user-${userId}` }),
      pusher({ page: "/top-up/transactions", to: `user-${userId}` }),
      pusher({ page: "/admin-area/dashboard/fund/info/pending", to: "admin" }),
    ]);

    res.json({ success: true });
  } catch (e) {
    console.error("SHKEEPER ERROR:", e);

    if (e instanceof UnloggingError) {
      res.status(400).json({
        success: false,
        message: e.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// POST /api/topup/callback
export async function topUpCallback(req: Request, res: Response) {
  try {
    const method = req.query.method as string;
    const incomingSecret = req.query.secret as string;

    if (method === "now-payments") {
      const expectedSecret = await SiteOptions.payment.nowPayments.callbackSecret.get();
      if (!expectedSecret || incomingSecret !== expectedSecret) {
        console.warn("CALLBACK: invalid NowPayments secret");
        return res.status(401).json({ success: false, message: "Invalid secret." });
      }
    } else if (method === "shkeeper") {
      const expectedSecret = process.env.SHKEEPER_CALLBACK_SECRET;
      if (!expectedSecret || incomingSecret !== expectedSecret) {
        console.warn("CALLBACK: invalid Shkeeper secret");
        return res.status(401).json({ success: false, message: "Invalid secret." });
      }
    } else {
      console.warn("CALLBACK: unknown method:", method);
      return res.status(400).json({ success: false, message: "Unknown payment method." });
    }

    if (method === "now-payments") {
      const { pay_address, payment_status, outcome } = req.body;
      const txid = outcome?.txid ?? req.body.txid ?? null;
      const isConfirmed = ["confirmed", "finished"].includes(payment_status);

      if (pay_address) {
        await db
          .update(AddedFundModel)
          .set({ txid, status: isConfirmed ? "approved" : "pending" })
          .where(eq(AddedFundModel.walletAddress, pay_address));

        console.log(`CALLBACK [now-payments]: ${pay_address} → ${isConfirmed ? "approved" : "pending"}`);
      }
    }

    if (method === "shkeeper") {
      const { external_id, txid, status } = req.body;
      const fundId = Number(external_id);
      const isConfirmed = status === "success";

      if (!isNaN(fundId) && fundId > 0) {
        await db
          .update(AddedFundModel)
          .set({ txid: txid ?? null, status: isConfirmed ? "approved" : "pending" })
          .where(eq(AddedFundModel.id, fundId));

        console.log(`CALLBACK [shkeeper]: fund#${fundId} → ${isConfirmed ? "approved" : "pending"}`);
      }
    }

    res.json({ success: true });
  } catch (e) {
    console.error("CALLBACK ERROR:", e);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// POST /api/topup/convert
export async function convertCurrency(req: Request, res: Response) {
  try {
    const { amount, currency } = z
      .object({
        amount: z.coerce.number().min(1),
        currency: z.string().min(1),
      })
      .parse(req.body);

    const apiKey = await SiteOptions.payment.nowPayments.apiKey.get();

    if (!apiKey) {
      throw new UnloggingError("NowPayments API key is not configured.");
    }

    const r: any = await fetch(
      `${nowPaymentsApiUrl}/estimate?amount=${
        (10 / 100) * amount + amount
      }&currency_from=USD&currency_to=${currency}&is_fixed_rate=False&is_fee_paid_by_user=False`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    ).then((r) => r.json());

    console.log("Convert API response:", JSON.stringify(r));

    res.json({
      success: true,
      convertedAmount: r.estimated_amount ?? null,
    });
  } catch (e) {
    console.error("CONVERT ERROR:", e);

    if (e instanceof UnloggingError) {
      res.status(400).json({
        success: false,
        message: e.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}