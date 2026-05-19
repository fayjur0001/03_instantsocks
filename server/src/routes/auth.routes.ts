import { Router } from "express";

import {
  login,
  logout,
  me,
  getUserBalance,
  getNotificationCount,
  loginAs,
  register,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  changePin,
} from "@/controllers/auth.controller";

import { requireAuth } from "@/middleware/auth.middleware";

const router = Router();

// ── Auth ─────────────────────────────────────────
router.post("/login", login);
router.post("/register", register);
router.post("/logout", requireAuth(), logout);

// ── Current user ────────────────────────────────
router.get("/me", requireAuth(), me);
router.get("/balance", requireAuth(), getUserBalance);
router.get("/notifications/count", requireAuth(), getNotificationCount);

// ── Admin only ──────────────────────────────────
router.post(
  "/login-as",
  requireAuth(["admin", "super admin"]),
  loginAs
);

// ── Password reset (public) ─────────────────────
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ── Profile B1 ──────────────────────────────────
router.get("/profile", requireAuth(), getProfile);
router.put("/profile", requireAuth(), updateProfile);

// ── Password & PIN B2 ───────────────────────────
router.post("/profile/change-password", requireAuth(), changePassword);
router.post("/profile/change-pin",      requireAuth(), changePin);

export default router;