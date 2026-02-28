import express from "express";
import {
  getAvailableCars,
  createBooking,
  getUserBookings,
  getOwnerBooking,
  ChangeBookingStatus,
  getOwnerDashboard,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

// Public routes
bookingRouter.get("/available-cars", getAvailableCars);

// Protected User Routes
bookingRouter.post("/create", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);

// Protected Owner Routes
bookingRouter.get("/owner", protect, getOwnerBooking);
bookingRouter.post("/status", protect, ChangeBookingStatus);
bookingRouter.get("/dashboard", protect, getOwnerDashboard);

export default bookingRouter;
