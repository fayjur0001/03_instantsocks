import { Request, Response } from "express";
import db from "@/db";
import {
  Socks5ProxyCartModel,
  Socks5AuthModel,
  Socks5ProxyTransactionModel,
  UserModel,
} from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { z } from "zod";
import getBalance from "@/utils/get-balance";
import SiteOptions from "@/utils/site-options";

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — external proxy API থেকে proxy list আনে
// ─────────────────────────────────────────────────────────────────────────────
async function fetchProxyList(params: Record<string, string>) {
  const apiKey = await SiteOptions.socks5ProxyAPIKey.get();
  const url = new URL("https://api.example-proxy-provider.com/list"); // তোমার real API URL দাও
  url.searchParams.set("api_key", apiKey);
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  const r = await fetch(url.toString()).then((res) => res.json());
  return r;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/proxy/list
// country, type, state filter সহ proxy list
// ─────────────────────────────────────────────────────────────────────────────
export async function getProxyList(req: Request, res: Response) {
  try {
    const { country, type, state, page, limit } = z
      .object({
        country: z.string().optional(),
        type: z.string().optional(),
        state: z.string().optional(),
        page: z.coerce.number().int().min(1).catch(1),
        limit: z.coerce.number().int().min(1).max(100).catch(20),
      })
      .parse(req.query);

    // 🔥 USE_MOCK = true রাখলে real API call হবে না — development এ কাজে আসে
    const USE_MOCK = true;

    if (USE_MOCK) {
      const mockProxies = Array.from({ length: 50 }, (_, i) => ({
        id: `proxy-${i + 1}`,
        ip: `192.168.${Math.floor(i / 10)}.${i % 10 + 1}`,
        domain: `proxy${i + 1}.example.com`,
        countryCode: country || "US",
        country: "United States",
        state: state || "New York",
        city: "New York City",
        isp: "T-Mobile",
        zip: "10001",
        speed: "50Mbps",
        ping: Math.floor(Math.random() * 100) + 10,
        type: type || "ISP",
        added: new Date().toISOString(),
        price: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        org: "T-Mobile USA",
        zone: "EST",
        dns: "8.8.8.8",
        blacklisted: false,
        usage: "0/100GB",
        connectionString: `socks5://user:pass@192.168.0.${i + 1}:1080`,
      }));

      const offset = (page - 1) * limit;
      const filtered = mockProxies.slice(offset, offset + limit);

      return res.json({
        success: true,
        proxies: filtered,
        total: mockProxies.length,
        totalPage: Math.ceil(mockProxies.length / limit),
      });
    }

    // 🔽 Real API call (USE_MOCK = false করলে এটা চলবে)
    const data = (await fetchProxyList({
      country: country || "",
      type: type || "",
      state: state || "",
      page: String(page),
      limit: String(limit),
    })) as any;

    return res.json({
      success: true,
      proxies: data.proxies || [],
      total: data.total || 0,
      totalPage: data.totalPage || 1,
    });
  } catch (err) {
    console.error("[getProxyList]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/proxy/cart
// ─────────────────────────────────────────────────────────────────────────────
export async function getCart(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const items = await db.query.Socks5ProxyCartModel.findMany({
      where: (m, { eq }) => eq(m.userId, userId),
      orderBy: [desc(Socks5ProxyCartModel.createdAt)],
    });

    return res.json({ success: true, items });
  } catch (err) {
    console.error("[getCart]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/proxy/cart
// body: { proxyId, price, originalPrice }
// ─────────────────────────────────────────────────────────────────────────────
export async function addToCart(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const { proxyId, price, originalPrice } = z
      .object({
        proxyId: z.string().min(1),
        price: z.number().positive(),
        originalPrice: z.number().positive(),
      })
      .parse(req.body);

    // ইতিমধ্যে cart এ আছে কিনা চেক
    const existing = await db.query.Socks5ProxyCartModel.findFirst({
      where: (m, { and, eq }) =>
        and(eq(m.userId, userId), eq(m.proxyId, proxyId)),
    });

    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Proxy already in cart." });
    }

    const [item] = await db
      .insert(Socks5ProxyCartModel)
      .values({ userId, proxyId, price, originalPrice })
      .returning();

    return res.status(201).json({ success: true, item });
  } catch (err) {
    console.error("[addToCart]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/proxy/cart/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function removeFromCart(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;
    const id = z.coerce.number().int().positive().parse(req.params.id);

    const item = await db.query.Socks5ProxyCartModel.findFirst({
      where: (m, { and, eq }) =>
        and(eq(m.id, id), eq(m.userId, userId)),
    });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found." });
    }

    await db
      .delete(Socks5ProxyCartModel)
      .where(
        and(
          eq(Socks5ProxyCartModel.id, id),
          eq(Socks5ProxyCartModel.userId, userId)
        )
      );

    return res.json({ success: true, message: "Removed from cart." });
  } catch (err) {
    console.error("[removeFromCart]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/proxy/rent
// body: { proxyIds: string[] }  — cart এর একটা বা সব proxy rent করে
// BUG FIX: redundant bulk delete সরানো হয়েছে, এখন শুধু inArray দিয়ে single clean delete
// ─────────────────────────────────────────────────────────────────────────────
export async function rentProxy(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const { proxyIds } = z
      .object({ proxyIds: z.array(z.string()).min(1) })
      .parse(req.body);

    // Cart থেকে এই proxyIds গুলো খোঁজো
    const cartItems = await db.query.Socks5ProxyCartModel.findMany({
      where: (m, { and, eq, inArray }) =>
        and(eq(m.userId, userId), inArray(m.proxyId, proxyIds)),
    });

    if (cartItems.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No matching cart items found." });
    }

    const totalCost = cartItems.reduce((sum, i) => sum + i.price, 0);
    const balance = await getBalance(userId);

    if (balance < totalCost) {
      return res
        .status(402)
        .json({ success: false, message: "Insufficient balance." });
    }

    // 🔥 Real proxy provider API call যাবে এখানে
    // এখন mock data দিয়ে transaction তৈরি করছি
    const transactions = await db
      .insert(Socks5ProxyTransactionModel)
      .values(
        cartItems.map((item) => ({
          userId,
          port: String(Math.floor(Math.random() * 9000) + 1000),
          note: null,
          originalPrice: item.originalPrice,
          price: item.price,
          country: "US",
          ip: `proxy-${item.proxyId}.example.com`,
          state: "New York",
          city: "New York City",
          zip: "10001",
          type: "ISP",
          auth: `user_${userId}:${Math.random().toString(36).slice(2, 10)}`,
        }))
      )
      .returning();

    // ✅ FIX: single inArray delete — আগের buggy double-delete সরানো হয়েছে
    const rentedProxyIds = cartItems.map((item) => item.proxyId);
    await db
      .delete(Socks5ProxyCartModel)
      .where(
        and(
          eq(Socks5ProxyCartModel.userId, userId),
          inArray(Socks5ProxyCartModel.proxyId, rentedProxyIds)
        )
      );

    return res.status(201).json({
      success: true,
      message: "Proxy rented successfully.",
      transactions,
    });
  } catch (err) {
    console.error("[rentProxy]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/proxy/my-rentals
// current user এর সব rented proxies
// ─────────────────────────────────────────────────────────────────────────────
export async function getMyRentals(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const { page, limit } = z
      .object({
        page: z.coerce.number().int().min(1).catch(1),
        limit: z.coerce.number().int().min(1).max(100).catch(20),
      })
      .parse(req.query);

    const offset = (page - 1) * limit;

    const all = await db.query.Socks5ProxyTransactionModel.findMany({
      where: (m, { eq }) => eq(m.userId, userId),
      orderBy: [desc(Socks5ProxyTransactionModel.createdAt)],
    });

    const total = all.length;
    const rentals = all.slice(offset, offset + limit);

    return res.json({
      success: true,
      rentals,
      total,
      totalPage: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[getMyRentals]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/proxy/auth
// user এর SOCKS5 username/password
// ─────────────────────────────────────────────────────────────────────────────
export async function getProxyAuth(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    let auth = await db.query.Socks5AuthModel.findFirst({
      where: (m, { eq }) => eq(m.userId, userId),
    });

    // Auth না থাকলে auto-create করো
    if (!auth) {
      const user = await db.query.UserModel.findFirst({
        where: (m, { eq }) => eq(m.id, userId),
        columns: { username: true },
      });

      const [created] = await db
        .insert(Socks5AuthModel)
        .values({
          userId,
          username: `${user!.username}_proxy`,
          password: Math.random().toString(36).slice(2, 12),
        })
        .returning();

      auth = created;
    }

    return res.json({ success: true, auth });
  } catch (err) {
    console.error("[getProxyAuth]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/proxy/swap-port
// body: { currentPort: string, newPort: string }
// ─────────────────────────────────────────────────────────────────────────────
export async function swapPort(req: Request, res: Response) {
  try {
    const userId = req.payload!.id;

    const { currentPort, newPort } = z
      .object({
        currentPort: z.string().min(1),
        newPort: z.string().min(1),
      })
      .parse(req.body);

    // User এর transaction এ currentPort আছে কিনা চেক করো
    const transaction = await db.query.Socks5ProxyTransactionModel.findFirst({
      where: (m, { and, eq }) =>
        and(eq(m.userId, userId), eq(m.port, currentPort)),
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Port not found in your rentals." });
    }

    // 🔥 Real provider API call এখানে যাবে
    // এখন DB update করছি
    await db
      .update(Socks5ProxyTransactionModel)
      .set({ port: newPort })
      .where(
        and(
          eq(Socks5ProxyTransactionModel.userId, userId),
          eq(Socks5ProxyTransactionModel.port, currentPort)
        )
      );

    return res.json({
      success: true,
      message: `Port swapped from ${currentPort} to ${newPort}.`,
    });
  } catch (err) {
    console.error("[swapPort]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/proxy/all  — admin: সব users এর proxy transactions
// ─────────────────────────────────────────────────────────────────────────────
export async function adminGetAllProxies(req: Request, res: Response) {
  try {
    const { page, limit, userId } = z
      .object({
        page: z.coerce.number().int().min(1).catch(1),
        limit: z.coerce.number().int().min(1).max(100).catch(20),
        userId: z.coerce.number().int().positive().optional(),
      })
      .parse(req.query);

    const offset = (page - 1) * limit;

    const all = await db.query.Socks5ProxyTransactionModel.findMany({
      where: userId ? (m, { eq }) => eq(m.userId, userId) : undefined,
      orderBy: [desc(Socks5ProxyTransactionModel.createdAt)],
    });

    // User info batch lookup
    const userIds = [...new Set(all.map((t) => t.userId))];
    const users = userIds.length
      ? await db.query.UserModel.findMany({
          where: (m, { inArray }) => inArray(m.id, userIds),
          columns: { id: true, username: true, email: true },
        })
      : [];
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const withUser = all.map((t) => ({ ...t, user: userMap[t.userId] || null }));
    const total = withUser.length;
    const transactions = withUser.slice(offset, offset + limit);

    return res.json({
      success: true,
      transactions,
      total,
      totalPage: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[adminGetAllProxies]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/proxy/ips  — admin: proxy IPs list (provider থেকে)
// ─────────────────────────────────────────────────────────────────────────────
export async function adminGetProxyIPs(req: Request, res: Response) {
  try {
    const { country, type, state, page, limit } = z
      .object({
        country: z.string().optional(),
        type: z.string().optional(),
        state: z.string().optional(),
        page: z.coerce.number().int().min(1).catch(1),
        limit: z.coerce.number().int().min(1).max(100).catch(20),
      })
      .parse(req.query);

    const USE_MOCK = true;

    if (USE_MOCK) {
      const mockIPs = Array.from({ length: 100 }, (_, i) => ({
        id: `ip-${i + 1}`,
        ip: `10.0.${Math.floor(i / 10)}.${i % 10 + 1}`,
        countryCode: country || "US",
        state: state || "New York",
        city: "New York City",
        isp: "T-Mobile",
        zip: "10001",
        type: type || "ISP",
        blacklisted: Math.random() > 0.9,
        price: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        originalPrice: parseFloat((Math.random() * 4 + 1).toFixed(2)),
      }));

      const offset = (page - 1) * limit;
      const filtered = mockIPs.slice(offset, offset + limit);

      return res.json({
        success: true,
        ips: filtered,
        total: mockIPs.length,
        totalPage: Math.ceil(mockIPs.length / limit),
      });
    }

    const data = (await fetchProxyList({
      country: country || "",
      type: type || "",
      state: state || "",
      page: String(page),
      limit: String(limit),
    })) as any;

    return res.json({
      success: true,
      ips: data.proxies || [],
      total: data.total || 0,
      totalPage: data.totalPage || 1,
    });
  } catch (err) {
    console.error("[adminGetProxyIPs]", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}