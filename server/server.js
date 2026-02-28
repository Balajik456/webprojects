import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Import routes
import userRouter from "./routes/userRouter.js";
import ownerRouter from "./routes/ownerRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
import carRouter from "./routes/carRouter.js";
import repairRouter from "./routes/repairRouter.js";
import mechanicShopRouter from "./routes/mechanicShopRouter.js";
import subscriptionRouter from "./routes/subscriptionRouter.js";

const app = express();

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB connection
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongoose) => {
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect DB middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "DB connection failed" });
  }
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/car", carRouter);
app.use("/api/repair", repairRouter);
app.use("/api/mechanic-shop", mechanicShopRouter);
app.use("/api/subscription", subscriptionRouter);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running!",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ success: false, message: err.message });
});

export default app;
