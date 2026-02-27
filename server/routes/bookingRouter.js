import express from "express";
import {
  getAvailableCars,
  createBooking,
  getUserBookings,
  getOwnerBooking,
  ChangeBookingStatus,
  getOwnerDashboard,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/auth.js"; // ✅ Changed to middlewares

const bookingRouter = express.Router();

// Public / Semi-public routes
bookingRouter.get("/available-cars", getAvailableCars);

// Protected User Routes
bookingRouter.post("/create", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);

// Protected Owner Routes
bookingRouter.get("/owner", protect, getOwnerBooking); // ✅ This should work
bookingRouter.post("/status", protect, ChangeBookingStatus);
bookingRouter.get("/dashboard", protect, getOwnerDashboard);

export default bookingRouter;
