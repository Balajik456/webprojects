import express from "express";
import {
  addRepair,
  getMyRepairs,
  updateRepairStatus,
  getAllRepairs,
  getRepairStats,
  findNearestShops,
  assignShopToRepair,
} from "../controllers/repairController.js";
import { protect } from "../middleware/auth.js";

const repairRouter = express.Router();

// User Endpoints
repairRouter.post("/add", protect, addRepair);
repairRouter.get("/my-repairs", protect, getMyRepairs);

// Owner Endpoints
repairRouter.get("/all", protect, getAllRepairs);
repairRouter.get("/nearest-shops/:repairId", protect, findNearestShops);
repairRouter.post("/assign-shop", protect, assignShopToRepair);
repairRouter.post("/update-status", protect, updateRepairStatus);
repairRouter.get("/stats", protect, getRepairStats);

export default repairRouter;
