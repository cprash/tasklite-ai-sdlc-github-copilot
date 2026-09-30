import { Router } from "express";

export const healthRouter = Router();

// Health check, returns the service status.
healthRouter.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" });
});
