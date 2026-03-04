import express from "express";
import {
  addMechanicShop,
  getAllShops,
  updateShop,
  deleteShop,
  checkSubscriptionStatus,
} from "../controllers/mechanicShopController.js";
import { protect } from "../middleware/auth.js";

const mechanicShopRouter = express.Router();
mechanicShopRouter.get("/check-status", checkSubscriptionStatus);

mechanicShopRouter.post("/add", protect, addMechanicShop);
mechanicShopRouter.get("/all", protect, getAllShops);
mechanicShopRouter.put("/update", protect, updateShop);
mechanicShopRouter.delete("/delete", protect, deleteShop);

export default mechanicShopRouter;
