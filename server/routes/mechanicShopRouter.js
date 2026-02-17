import express from "express";
import {
  addMechanicShop,
  getAllShops,
  updateShop,
  deleteShop,
} from "../controllers/mechanicShopController.js";
import { protect } from "../middleware/auth.js";

const mechanicShopRouter = express.Router();

mechanicShopRouter.post("/add", protect, addMechanicShop);
mechanicShopRouter.get("/all", protect, getAllShops);
mechanicShopRouter.put("/update", protect, updateShop);
mechanicShopRouter.delete("/delete", protect, deleteShop);

export default mechanicShopRouter;
