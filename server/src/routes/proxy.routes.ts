import { Router } from "express";
import { requireAuth } from "@/middleware/auth.middleware";
import {
  getProxyList,
  getCart,
  addToCart,
  removeFromCart,
  rentProxy,
  getMyRentals,
  getProxyAuth,
  swapPort,
} from "@/controllers/proxy.controller";

const router = Router();

// সব proxy routes এ login লাগবে
router.use(requireAuth());

// I1 — Proxy List & Cart & Rent
router.get("/list", getProxyList);
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.delete("/cart/:id", removeFromCart);
router.post("/rent", rentProxy);

// I2 — My Rentals & Auth & Swap Port
router.get("/my-rentals", getMyRentals);
router.get("/auth", getProxyAuth);
router.post("/swap-port", swapPort);

export default router;