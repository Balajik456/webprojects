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

/* ================= CORS MIDDLEWARE ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://car-rental-services-theta.vercel.app",
  "https://webprojects-phi.vercel.app",
  "https://webprojects-server.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked origin:", origin);
        callback(null, true); // Allow anyway for now during debugging
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

/* ================= BODY PARSERS ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================= DATABASE ================= */
let dbConnected = false;

const ensureDBConnection = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
};

// Connect to DB before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (error) {
    console.error("DB Connection Error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

/* ================= ROUTES ================= */
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/car", carRouter);
app.use("/api/repair", repairRouter);
app.use("/api/mechanic-shop", mechanicShopRouter);
app.use("/api/subscription", subscriptionRouter);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Car Rental API Server is running!",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
    },
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    endpoints: [
      "/api/user",
      "/api/owner",
      "/api/bookings",
      "/api/car",
      "/api/repair",
      "/api/mechanic-shop",
      "/api/subscription",
    ],
  });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  console.error("STACK:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

/* ================= EXPORT FOR VERCEL ================= */
export default app;

/* ================= LOCAL DEVELOPMENT ================= */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}
