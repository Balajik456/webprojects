import Repair from "../models/Repair.js";
import MechanicShop from "../models/MechanicShop.js";

// ✅ Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// ✅ Add repair request (saves user location)
export const addRepair = async (req, res) => {
  try {
    const {
      car,
      issue,
      date,
      pickupAddress,
      serviceType,
      latitude,
      longitude,
    } = req.body;

    if (!serviceType || !["Self-Drive", "Doorstep"].includes(serviceType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid service type" });
    }

    const newRepair = await Repair.create({
      user: req.user._id,
      car,
      issue,
      date,
      pickupAddress,
      latitude,
      longitude,
      serviceType,
      status: "Pending", // Owner will assign shop
    });

    res.status(201).json({
      success: true,
      message: "Repair request submitted! We'll assign a nearby shop soon.",
      repair: newRepair,
    });
  } catch (error) {
    console.error("Repair creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all pending repairs (for owner to assign shops)
export const getAllRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find({})
      .populate("user", "name email phone")
      .populate("assignedShop")
      .sort({ createdAt: -1 });
    res.json({ success: true, repairs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Find nearest shops for a repair request
export const findNearestShops = async (req, res) => {
  try {
    const { repairId } = req.params;
    const repair = await Repair.findById(repairId);

    if (!repair) {
      return res
        .status(404)
        .json({ success: false, message: "Repair not found" });
    }

    if (!repair.latitude || !repair.longitude) {
      return res
        .status(400)
        .json({ success: false, message: "User location not available" });
    }

    // Get all active shops
    const shops = await MechanicShop.find({ isActive: true });

    // Calculate distance for each shop
    const shopsWithDistance = shops.map((shop) => ({
      ...shop.toObject(),
      distance: calculateDistance(
        repair.latitude,
        repair.longitude,
        shop.latitude,
        shop.longitude,
      ),
    }));

    // Sort by nearest first
    shopsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({ success: true, shops: shopsWithDistance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Assign shop to repair
export const assignShopToRepair = async (req, res) => {
  try {
    const { repairId, shopId } = req.body;

    const repair = await Repair.findByIdAndUpdate(
      repairId,
      {
        assignedShop: shopId,
        status: "Assigned",
      },
      { new: true },
    )
      .populate("assignedShop")
      .populate("user", "name email phone");

    res.json({
      success: true,
      message: "Shop assigned successfully!",
      repair,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get user's repairs
export const getMyRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find({ user: req.user._id })
      .populate("assignedShop")
      .sort({ createdAt: -1 });
    res.json({ success: true, repairs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update repair status
export const updateRepairStatus = async (req, res) => {
  try {
    const { repairId, status, cost } = req.body;
    const repair = await Repair.findByIdAndUpdate(
      repairId,
      { status, cost },
      { new: true },
    );
    res.json({ success: true, message: "Status updated!", repair });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get repair stats
export const getRepairStats = async (req, res) => {
  try {
    const totalRepairs = await Repair.countDocuments({});
    const pendingRepairs = await Repair.countDocuments({ status: "Pending" });
    const assignedRepairs = await Repair.countDocuments({ status: "Assigned" });
    const inProgressRepairs = await Repair.countDocuments({
      status: "In Progress",
    });
    const completedRepairs = await Repair.countDocuments({
      status: "Completed",
    });

    const completedRepairsWithCost = await Repair.find({
      status: "Completed",
      cost: { $gt: 0 },
    });

    const totalEarnings = completedRepairsWithCost.reduce((sum, repair) => {
      return sum + (repair.cost || 0);
    }, 0);

    res.json({
      success: true,
      stats: {
        totalRepairs,
        pendingRepairs,
        assignedRepairs,
        inProgressRepairs,
        completedRepairs,
        totalEarnings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
