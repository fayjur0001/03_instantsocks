import { Router } from "express";
import {
  getLastFunds,
  getTopupTransactions,
  generateNowPayments,
  generateShkeeper,
  topUpCallback,
  convertCurrency,
  getAdminTransactions,
  createAdminTransaction,
  updateAdminTransaction,
  deleteAdminTransaction,
} from "@/controllers/topup.controller";
import { requireAuth } from "@/middleware/auth.middleware";

const router = Router();

// ── Public (callback — no auth needed) ────────────────────────────────────
router.post("/callback", topUpCallback);

// ── Authenticated routes ───────────────────────────────────────────────────
router.use(requireAuth());

// User routes
router.get("/last-funds", getLastFunds);
router.get("/transactions", getTopupTransactions);
router.post("/now-payments", generateNowPayments);
router.post("/shkeeper", generateShkeeper);
router.post("/convert", convertCurrency);

// ── Admin-only routes ──────────────────────────────────────────────────────
router.get("/admin/transactions", requireAuth(["admin", "super admin"]), getAdminTransactions);
router.post("/admin/transactions", requireAuth(["admin", "super admin"]), createAdminTransaction);
router.put("/admin/transactions/:id", requireAuth(["admin", "super admin"]), updateAdminTransaction);
router.delete("/admin/transactions/:id", requireAuth(["admin", "super admin"]), deleteAdminTransaction);

export default router;