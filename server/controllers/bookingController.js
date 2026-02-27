import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// ==========================================
// CHECK AVAILABILITY (Helper Function)
// ==========================================
const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    status: { $ne: "cancelled" },
    $or: [
      {
        pickupDate: { $lte: new Date(returnDate) },
        returnDate: { $gte: new Date(pickupDate) },
      },
    ],
  });
  return bookings.length === 0;
};

// ==========================================
// SEARCH AVAILABLE CARS (User)
// ==========================================
export const getAvailableCars = async (req, res) => {
  try {
    const { pickupLocation, pickupDate, returnDate } = req.query;

    const cars = await Car.find({
      location: { $regex: new RegExp(pickupLocation, "i") },
      isAvailable: true,
    });

    res.json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// CREATE BOOKING (User)
// ==========================================
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate } = req.body;

    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Car is no longer available",
      });
    }

    const carData = await Car.findById(car);
    if (!carData) {
      return res.json({ success: false, message: "Car not found" });
    }

    // Calculate Price
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
    const price = carData.priceperday * (noOfDays > 0 ? noOfDays : 1);

    await Booking.create({
      car,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      price,
    });

    res.json({ success: true, message: "Booking Request Sent!" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// GET USER'S BOOKINGS
// ==========================================
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("car")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// GET OWNER'S BOOKINGS - ✅ FIXED
// ==========================================
export const getOwnerBooking = async (req, res) => {
  try {
    console.log("=== Fetching Owner Bookings ===");
    console.log("User ID:", req.user._id);
    console.log("User Role:", req.user.role);

    let bookings;

    // ✅ If user is ADMIN or OWNER, show ALL bookings
    if (req.user.role === "admin" || req.user.role === "owner") {
      bookings = await Booking.find({})
        .populate("car", "brand model category image year location priceperday")
        .populate("user", "name email phone")
        .sort({ createdAt: -1 });

      console.log(`✅ Admin/Owner: Showing all ${bookings.length} bookings`);
    } else {
      // ✅ Regular users only see bookings for THEIR cars
      const ownedCars = await Car.find({ owner: req.user._id });
      const carIds = ownedCars.map((car) => car._id);

      console.log(`✅ Regular user: Found ${ownedCars.length} owned cars`);

      bookings = await Booking.find({ car: { $in: carIds } })
        .populate("car", "brand model category image year location priceperday")
        .populate("user", "name email phone")
        .sort({ createdAt: -1 });

      console.log(`✅ Found ${bookings.length} bookings for owned cars`);
    }

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Owner bookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// CHANGE STATUS (Owner Action)
// ==========================================
export const ChangeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    console.log("Change status request:", { bookingId, status });

    const booking = await Booking.findById(bookingId).populate("car");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ ALLOW ADMIN/OWNER to change any booking
    const isAdmin = req.user.role === "admin" || req.user.role === "owner";
    const isCarOwner = booking.car.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isCarOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Not your booking",
      });
    }

    booking.status = status;
    await booking.save();

    console.log(`✅ Booking ${bookingId} status changed to ${status}`);

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
    });
  } catch (error) {
    console.error("Change booking status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DASHBOARD STATS
// ==========================================
export const getOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin" || req.user.role === "owner";

    let carIds;
    let totalCars;

    // ✅ Admin sees ALL cars/bookings
    if (isAdmin) {
      const allCars = await Car.find({});
      carIds = allCars.map((car) => car._id);
      totalCars = allCars.length;
    } else {
      // ✅ Regular users see only their cars/bookings
      const ownedCars = await Car.find({ owner: userId });
      carIds = ownedCars.map((car) => car._id);
      totalCars = ownedCars.length;
    }

    // Count bookings
    const totalBookings = await Booking.countDocuments({
      car: { $in: carIds },
    });
    const pendingBookings = await Booking.countDocuments({
      car: { $in: carIds },
      status: "pending",
    });
    const confirmedBookings = await Booking.countDocuments({
      car: { $in: carIds },
      status: "confirmed",
    });

    // Revenue Aggregation
    const revenueData = await Booking.aggregate([
      {
        $match: {
          car: { $in: carIds },
          status: "confirmed",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$price" } },
        },
      },
    ]);

    const monthlyRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalCars,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Dashboard error",
    });
  }
};
