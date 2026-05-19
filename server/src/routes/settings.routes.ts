import { Router } from "express";
import { requireAuth } from "@/middleware/auth.middleware";
import {
  getSettings, updateSettings,
  getPaymentApi, updatePaymentApi,
  getProductsApi, updateProductsApi,
  getPricing, updatePricing,
} from "@/controllers/settings.controller";

const router = Router();
const adminOnly = requireAuth(["admin", "super admin"]);

router.get("/settings",      adminOnly, getSettings);
router.put("/settings",      adminOnly, updateSettings);
router.get("/payment-api",   adminOnly, getPaymentApi);
router.put("/payment-api",   adminOnly, updatePaymentApi);
router.get("/products-api",  adminOnly, getProductsApi);
router.put("/products-api",  adminOnly, updateProductsApi);
router.get("/pricing",       adminOnly, getPricing);
router.put("/pricing",       adminOnly, updatePricing);

export default router;