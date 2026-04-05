import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

// CORS - Allow all origins for now
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB Connection (Serverless-friendly)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Connect before each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Database connection failed" });
  }
});

// Import routes dynamically to avoid errors
let userRouter,
  ownerRouter,
  bookingRouter,
  carRouter,
  repairRouter,
  mechanicShopRouter,
  subscriptionRouter;

try {
  userRouter = (await import("./routes/userRouter.js")).default;
} catch (e) {
  console.error("userRouter import failed");
}

try {
  ownerRouter = (await import("./routes/ownerRouter.js")).default;
} catch (e) {
  console.error("ownerRouter import failed");
}

try {
  bookingRouter = (await import("./routes/bookingRouter.js")).default;
} catch (e) {
  console.error("bookingRouter import failed");
}

try {
  carRouter = (await import("./routes/carRouter.js")).default;
} catch (e) {
  console.error("carRouter import failed");
}

try {
  repairRouter = (await import("./routes/repairRouter.js")).default;
} catch (e) {
  console.error("repairRouter import failed");
}

try {
  mechanicShopRouter = (await import("./routes/mechanicShopRouter.js")).default;
} catch (e) {
  console.error("mechanicShopRouter import failed");
}

try {
  subscriptionRouter = (await import("./routes/subscriptionRouter.js")).default;
} catch (e) {
  console.error("subscriptionRouter import failed");
}

// Routes (only use if imported successfully)
if (userRouter) app.use("/api/user", userRouter);
if (ownerRouter) app.use("/api/owner", ownerRouter);
if (bookingRouter) app.use("/api/bookings", bookingRouter);
if (carRouter) app.use("/api/car", carRouter);
if (repairRouter) app.use("/api/repair", repairRouter);
if (mechanicShopRouter) app.use("/api/mechanic-shop", mechanicShopRouter);
if (subscriptionRouter) app.use("/api/subscription", subscriptionRouter);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Car Rental API is running!",
    timestamp: new Date().toISOString(),
    routes: {
      user: !!userRouter,
      owner: !!ownerRouter,
      bookings: !!bookingRouter,
      car: !!carRouter,
      repair: !!repairRouter,
      mechanicShop: !!mechanicShopRouter,
      subscription: !!subscriptionRouter,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
