import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { attachAuth } from "@/middleware/auth.middleware";
import { errorHandler, notFound } from "@/middleware/error.middleware";

import authRoutes from "@/routes/auth.routes";
import usersRoutes from "@/routes/users.routes";
import supportRoutes from "@/routes/support.routes";
import topupRoutes from "@/routes/topup.routes";
import numbersRoutes from "@/routes/numbers.routes";
import settingsRoutes from "@/routes/settings.routes";
import rentalsRoutes from "@/routes/rentals.routes";          // ← নতুন
import adminRentalsRoutes from "@/routes/admin-rentals.routes"; // ← নতুন
import proxyRoutes from "@/routes/proxy.routes";
import adminProxyRoutes from "@/routes/admin-proxy.routes";

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

app.use(attachAuth);

// Root Route
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Backend server is running successfully",
  });
});

// Health Route
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
  });
});

// API Routes
app.use("/api/auth", authRoutes);

app.use("/api/admin/users", usersRoutes);

app.use("/api/support", supportRoutes);

app.use("/api/topup", topupRoutes);

app.use("/api/numbers", numbersRoutes);

app.use("/api/rentals", rentalsRoutes);    

app.use("/api/proxy", proxyRoutes);
app.use("/api/admin/proxy", adminProxyRoutes);// ← নতুন

app.use("/api/admin", settingsRoutes);

app.use("/api/admin/rentals", adminRentalsRoutes); // ← নতুন (settingsRoutes এর পরে)


// 404 Route
app.use(notFound);

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(
    `✅ Server running on http://localhost:${PORT}`
  );
});

export default app;