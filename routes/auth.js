import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ─── REGISTER ───────────────────────────────────────────
// POST /api/auth/register
// Creates a new user account
router.post("/register", async (req, res) => {
  try {
    // Get name, email and password from the request body
    const { name, email, password } = req.body;

    // Check all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password before saving — never store raw passwords
    // 12 is the cost factor — higher means more secure but slower
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the new user in MongoDB
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    // Generate a JWT token so the user is logged in immediately after registering
    const token = jwt.sign(
      { userId: user._id, name: user.name }, // payload — what's inside the token
      process.env.JWT_SECRET, // secret key from .env
      { expiresIn: "7d" }, // token expires in 7 days
    );

    // Send back the token and basic user info
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── LOGIN ──────────────────────────────────────────────
// POST /api/auth/login
// Logs in an existing user and returns a token
router.post("/login", async (req, res) => {
  try {
    // Get email and password from the request body
    const { email, password } = req.body;

    // Check both fields are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the submitted password against the stored hash
    // bcrypt.compare returns true if they match, false if not
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Send back the token and basic user info
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
