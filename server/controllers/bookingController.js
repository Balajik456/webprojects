import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// ==========================================
// 1. CHECK AVAILABILITY (Helper Function)
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
// 2. SEARCH AVAILABLE CARS (User)
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
// 3. CREATE BOOKING (User)
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
// 5. GET OWNER'S BOOKINGS (List View) - ✅ ADMIN FIX
// ==========================================
export const getOwnerBooking = async (req, res) => {
  try {
    console.log("=== Fetching Owner Bookings ===");
    console.log("User ID:", req.user._id);
    console.log("User Role:", req.user.role);

    // ✅ If user is ADMIN, show ALL bookings
    if (req.user.role === "admin") {
      const allBookings = await Booking.find({})
        .populate("car")
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      console.log(`✅ Admin: Showing all ${allBookings.length} bookings`);
      return res.json({ success: true, bookings: allBookings });
    }

    // ✅ Regular users only see bookings for THEIR cars
    const ownedCars = await Car.find({ owner: req.user._id });
    const carIds = ownedCars.map((car) => car._id);

    console.log(`✅ Regular user: Found ${ownedCars.length} owned cars`);

    const bookings = await Booking.find({
      car: { $in: carIds },
    })
      .populate("car")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${bookings.length} bookings for owned cars`);

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Owner bookings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. CHANGE STATUS (Owner Action) - ✅ FIXED FOR ADMIN
// ==========================================
export const ChangeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const booking = await Booking.findById(bookingId).populate("car");

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    // ✅ ALLOW ADMIN to change any booking
    // ✅ ALLOW CAR OWNER to change their bookings
    const isAdmin = req.user.role === "admin";
    const isOwner = booking.car.owner.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Not your booking",
      });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: `Booking ${status}` });
  } catch (error) {
    console.error("Change booking status error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. DASHBOARD STATS (Owner Dashboard)
// ==========================================
export const getOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === "admin";

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
        $group: { _id: null, total: { $sum: { $toDouble: "$price" } } },
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
    res.status(500).json({ success: false, message: "Dashboard error" });
  }
};
