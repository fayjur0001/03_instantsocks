import { Router } from "express";
import { requireAuth } from "@/middleware/auth.middleware";
import {
  adminGetAllProxies,
  adminGetProxyIPs,
} from "@/controllers/proxy.controller";

const router = Router();

// Admin only
router.use(requireAuth(["admin", "super admin"]));

// I3 — Admin Proxy Management
router.get("/all", adminGetAllProxies);   // GET /api/admin/proxy/all
router.get("/ips", adminGetProxyIPs);     // GET /api/admin/proxy/ips

export default router;