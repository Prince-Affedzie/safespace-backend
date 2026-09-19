import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import screeningRoutes from "./routes/screening.js";
import postRoutes from "./routes/posts.js";
import resourceRoutes from "./routes/resources.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/screening", screeningRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/resources", resourceRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "SafeSpace API is running" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, { dbName: "safespace-gh" })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
