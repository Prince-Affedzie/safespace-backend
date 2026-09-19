import express from "express";
import Resource from "../models/Resource.js";

const router = express.Router();

// ════════════════════════════════════════════════════════
// GET /api/resources
// Fetch all resources, optionally filtered by category
// Public — no token required
// ════════════════════════════════════════════════════════
router.get("/", async (req, res) => {
  try {
    // req.query.category comes from the URL like:
    // /api/resources?category=Depression
    // If no category is provided, fetch all resources
    const filter = req.query.category ? { category: req.query.category } : {};

    const resources = await Resource.find(filter).sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
