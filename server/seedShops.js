import mongoose from "mongoose";
import dotenv from "dotenv";
import MechanicShop from "./models/MechanicShop.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/car-rental";

const dummyShops = [
  {
    shopName: "Chennai Auto Works",
    ownerName: "Raj Kumar",
    phoneNumber: "919876543210", // WhatsApp format: country code + number (no + or spaces)
    address: "123 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017",
    city: "Chennai",
    latitude: 13.0418,
    longitude: 80.2341,
    specialization: ["Engine", "Brake", "Electrical"],
    isActive: true,
  },
  {
    shopName: "Express Car Service",
    ownerName: "Suresh Babu",
    phoneNumber: "919988776655",
    address: "45 Mount Road, New Bus Stand, vellore, Tamil Nadu 6000312",
    city: "vellore",
    latitude: 13.0067,
    longitude: 80.2206,
    specialization: ["General Repair", "AC Service", "Oil Change"],
    isActive: true,
  },
  {
    shopName: "Speed Auto Garage",
    ownerName: "Karthik Rajan",
    phoneNumber: "919123456789",
    address: "78 Gandhi Main Road, Arani, Tiruvannamalai, Tamil Nadu 600042",
    city: "Tiruvannamalai",
    latitude: 12.975,
    longitude: 80.2212,
    specialization: ["Transmission", "Engine", "Suspension"],
    isActive: true,
  },
  {
    shopName: "Prime Motors",
    ownerName: "Vijay Kumar",
    phoneNumber: "919876512345",
    address: "92 OMR Road, Nellukara Street , kanchipuram, Tamil Nadu 600096",
    city: "kanchipuram",
    latitude: 12.961,
    longitude: 80.243,
    specialization: ["Body Work", "Paint", "Denting"],
    isActive: true,
  },
  {
    shopName: "Elite Car Care",
    ownerName: "Arun Prakash",
    phoneNumber: "919988112233",
    address: "156 ECR Road, Neelankarai, Chennai, Tamil Nadu 600115",
    city: "Chennai",
    latitude: 12.948,
    longitude: 80.2591,
    specialization: ["Luxury Cars", "Import Cars", "Diagnostics"],
    isActive: true,
  },
];

const seedShops = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Clear existing shops
    await MechanicShop.deleteMany({});
    console.log("🗑️  Cleared existing shops");

    // Insert dummy shops
    const shops = await MechanicShop.insertMany(dummyShops);
    console.log(`✅ Added ${shops.length} mechanic shops`);

    shops.forEach((shop) => {
      console.log(`   - ${shop.shopName} (${shop.city})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedShops();
