import { Router } from "express";
import { pool } from "../config/db.js";

export const healthRouter = Router();

healthRouter.get("/health", async (req, res) => {
  try {
    await pool.query("select 1");
    res.json({ status: "ok", db: "up" });
  } catch (err) {
    res.status(503).json({ status: "error", db: "down", message: err.message });
  }
});
