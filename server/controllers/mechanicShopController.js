import MechanicShop from "../models/MechanicShop.js";

// ✅ Add a new mechanic shop
export const addMechanicShop = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      phoneNumber,
      address,
      city,
      latitude,
      longitude,
      specialization,
    } = req.body;

    const shop = await MechanicShop.create({
      shopName,
      ownerName,
      phoneNumber,
      address,
      city,
      latitude,
      longitude,
      specialization: specialization || ["General Repair"],
    });

    res.status(201).json({ success: true, message: "Shop added!", shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all mechanic shops
export const getAllShops = async (req, res) => {
  try {
    const shops = await MechanicShop.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json({ success: true, shops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update shop details
export const updateShop = async (req, res) => {
  try {
    const { shopId, ...updateData } = req.body;
    const shop = await MechanicShop.findByIdAndUpdate(shopId, updateData, {
      new: true,
    });
    res.json({ success: true, message: "Shop updated!", shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete/Deactivate shop
export const deleteShop = async (req, res) => {
  try {
    const { shopId } = req.body;
    await MechanicShop.findByIdAndUpdate(shopId, { isActive: false });
    res.json({ success: true, message: "Shop deactivated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
