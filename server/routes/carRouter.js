import express from "express";
import Car from "../models/Car.js";

const carRouter = express.Router();

/* ✅ FIXED: Added /cars route to match Cars.jsx fetchAllCars() */
carRouter.get("/cars", async (req, res) => {
  try {
    // Only fetch cars that are marked as available in the DB
    const cars = await Car.find({ isAvailable: true });
    res.json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ✅ KEEPING: /list route to match Appcontext getCarsData() */
carRouter.get("/list", async (req, res) => {
  try {
    const cars = await Car.find({ isAvailable: true });
    res.json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* GET SINGLE CAR DETAILS */
carRouter.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.json({ success: false, message: "Car not found" });
    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default carRouter;
