import express from "express";
import Car from "../models/Car.js";

const carRouter = express.Router();

/* GET ALL AVAILABLE CARS */
carRouter.get("/cars", async (req, res) => {
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

    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default carRouter;
