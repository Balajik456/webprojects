import mongoose from "mongoose";

const repairSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    car: { type: String, required: true },
    issue: { type: String, required: true },
    date: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    latitude: { type: Number }, // User's location
    longitude: { type: Number }, // User's location
    serviceType: {
      type: String,
      enum: ["Self-Drive", "Doorstep"],
      default: "Self-Drive",
      required: true,
    },

    // ✅ NEW: Assigned mechanic shop
    assignedShop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MechanicShop",
    },

    cost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

const Repair = mongoose.model("Repair", repairSchema);
export default Repair;
