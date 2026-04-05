import express from "express";
import {
  selfRegisterAndSubscribe,
  getPendingSubscriptions,
  getAllSubscriptions,
  approveSubscription,
  rejectSubscription,
  getSubscriptionDetails,
} from "../controllers/subscriptionController.js";
import { protect } from "../middleware/auth.js"; // ✅ CHANGED from middleware to middlewares

const subscriptionRouter = express.Router();

// Public - no auth needed
subscriptionRouter.post("/self-register", selfRegisterAndSubscribe);
subscriptionRouter.get("/details/:shopId", getSubscriptionDetails);

// Admin protected
subscriptionRouter.get("/pending", protect, getPendingSubscriptions);
subscriptionRouter.get("/all", protect, getAllSubscriptions);
subscriptionRouter.post("/approve", protect, approveSubscription);
subscriptionRouter.post("/reject", protect, rejectSubscription);

export default subscriptionRouter;
