import mongoose from "mongoose";

const mechanicShopSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true }, // ✅ Add this if missing
    address: { type: String, required: true },
    city: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    specialization: { 
      type: [String], 
      default: ["General Repair"] 
    },
    
    // Subscription fields
    subscriptionPlan: {
      type: String,
      enum: ["monthly", "annual", "none"],
      default: "none"
    },
    subscriptionAmount: {
      type: Number,
      default: 0
    },
    subscriptionStartDate: {
      type: Date,
      default: null
    },
    subscriptionEndDate: {
      type: Date,
      default: null
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", "pending"],
      default: "pending"
    },
    paymentHistory: [{
      amount: Number,
      plan: String,
      transactionId: String,
      date: { type: Date, default: Date.now },
      status: { type: String, default: "pending" }
    }],
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MechanicShop = mongoose.model("MechanicShop", mechanicShopSchema);
export default MechanicShop;