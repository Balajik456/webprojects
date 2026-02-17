import mongoose from "mongoose";

const mechanicShopSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    specialization: {
      type: [String],
      default: ["General Repair"],
    }, // e.g., ["Engine", "Brake", "Electrical"]
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const MechanicShop = mongoose.model("MechanicShop", mechanicShopSchema);
export default MechanicShop;
