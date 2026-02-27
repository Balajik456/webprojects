import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRouter.js";
import ownerRouter from "./routes/ownerRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
import carRouter from "./routes/carRouter.js";
import repairRouter from "./routes/repairRouter.js";
import mechanicShopRouter from "./routes/mechanicShopRouter.js";
import subscriptionRouter from "./routes/subscriptionRouter.js";

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://car-rental-services-theta.vercel.app",
      "https://webprojects-phi.vercel.app", // ✅ Added to fix CORS errors
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ FIX: Change '*' to '(.*)' to prevent the "Missing parameter name" crash
app.options("(.*)", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================= DB ================= */
connectDB(); // Ensure MONGO_URI is in Vercel Environment Variables

/* ================= ROUTES ================= */
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/car", carRouter);
app.use("/api/repair", repairRouter);
app.use("/api/mechanic-shop", mechanicShopRouter);
app.use("/api/subscription", subscriptionRouter);

app.get("/", (req, res) => {
  res.send("Server running OK");
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);
  res
    .status(500)
    .json({ success: false, message: err.message || "Server error" });
});

/* ================= EXPORT FOR VERCEL ================= */
export default app;
