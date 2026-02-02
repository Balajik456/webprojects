import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// ==========================================
// 1. CHECK AVAILABILITY (Helper Function)
// ==========================================
const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    status: { $ne: "cancelled" }, // Ignore cancelled bookings
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
// 2. SEARCH AVAILABLE CARS (User)
// ==========================================
export const getAvailableCars = async (req, res) => {
  try {
    const { pickupLocation, pickupDate, returnDate } = req.query;

    // Validation
    if (!pickupLocation || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "Location and dates are required",
      });
    }

    // Find cars that are busy during these dates
    const busyBookings = await Booking.find({
      status: { $ne: "cancelled" },
      $or: [
        {
          pickupDate: { $lte: new Date(returnDate) },
          returnDate: { $gte: new Date(pickupDate) },
        },
      ],
    }).select("car");

    const busyCarIds = busyBookings.map((b) => b.car);

    // Find cars in location that are NOT busy
    const cars = await Car.find({
      location: { $regex: pickupLocation, $options: "i" },
      isAvailable: true,
      _id: { $nin: busyCarIds },
    });

    res.json({ success: true, cars });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. CREATE BOOKING (User)
// ==========================================
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate } = req.body;

    // Double check availability before booking
    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Car is no longer available",
      });
    }

    const carData = await Car.findById(car);
    if (!carData) return res.json({ success: false, message: "Car not found" });

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
// 4. GET USER'S BOOKINGS
// ==========================================
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("car")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. GET OWNER'S BOOKINGS (List View)
// ==========================================
export const getOwnerBooking = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user", "-password") // Populate car and user (hide password)
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. CHANGE STATUS (Owner Action)
// ==========================================
export const ChangeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    // Verify ownership
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: `Booking ${status}` });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. DASHBOARD STATS (Owner Dashboard)
// ==========================================
export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Basic Counts
    const totalCars = await Car.countDocuments({ owner: ownerId });
    const totalBookings = await Booking.countDocuments({ owner: ownerId });
    const pendingBookings = await Booking.countDocuments({
      owner: ownerId,
      status: "pending",
    });
    const confirmedBookings = await Booking.countDocuments({
      owner: ownerId,
      status: "confirmed",
    });

    // Calculate Monthly Revenue (Current Month, Confirmed Only)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueData = await Booking.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(ownerId),
          status: "confirmed",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$price" } },
      },
    ]);

    const monthlyRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Recent 5 Bookings
    const recentBookings = await Booking.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("car", "brand model image")
      .populate("user", "name");

    res.json({
      success: true,
      stats: {
        totalCars,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        monthlyRevenue,
      },
      recentBookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Dashboard error" });
  }
};
