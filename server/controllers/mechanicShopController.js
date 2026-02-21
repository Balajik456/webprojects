import MechanicShop from "../models/MechanicShop.js";

// ✅ Add a new mechanic shop
export const addMechanicShop = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      phoneNumber,
      address,
      email,
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
      email,
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

    // Ensure numeric values are correctly parsed if they are in the updateData
    if (updateData.latitude)
      updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude)
      updateData.longitude = parseFloat(updateData.longitude);

    const shop = await MechanicShop.findByIdAndUpdate(shopId, updateData, {
      new: true,
      runValidators: true, // Ensures the updated email/fields still meet schema requirements
    });

    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });

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
