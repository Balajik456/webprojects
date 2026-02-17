// import express from "express";
// import { addCar, changeRoleToOwner, Deletecar, getDashboardData, getOwnerCars, toggleCarAvailability, updateUserImage } from "../controllers/ownerController.js";
// import { protect } from "../middleware/auth.js";
// import upload from "../middleware/upload.js";

// const ownerRouter = express.Router();

// ownerRouter.post(
//   "/add-car",
//   protect,
//   upload.single("image"), // 🔥 MUST MATCH POSTMAN KEY
//   addCar
// );

// ownerRouter.post("/change-role", protect, changeRoleToOwner);
// // ownerRouter.get("/cars", protect, getOwnerCars);
// ownerRouter.post("/toggle-car", protect, toggleCarAvailability);
// ownerRouter.post("/delete-role", protect, Deletecar);
// ownerRouter.get("/dashboard",protect,getDashboardData)
// ownerRouter.post("/update-image",protect,upload.single("image"),updateUserImage)

// export default ownerRouter;

import express from "express";
import {
  addCar,
  changeRoleToOwner,
  deleteCar,
 
  getOwnerCars,
  getFinanceStats,
  toggleCarAvailability,
  updateUserImage,
} from "../controllers/ownerController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const ownerRouter = express.Router();

/* ===============================
   OWNER ROLE
================================ */
ownerRouter.post("/change-role", protect, changeRoleToOwner);

/* ===============================
   CARS
================================ */
ownerRouter.post(
  "/add-car",
  protect,
  upload.single("image"), // MUST match frontend / Postman key
  addCar
);

ownerRouter.get("/cars", protect, getOwnerCars);

ownerRouter.post("/toggle-car", protect, toggleCarAvailability);

ownerRouter.post("/delete-car", protect, deleteCar);

/* ===============================
   DASHBOARD
================================ */

ownerRouter.get("/dashboard-stats", protect, getFinanceStats);

/* ===============================
   PROFILE IMAGE
================================ */
ownerRouter.post(
  "/update-image",
  protect,
  upload.single("image"),
  updateUserImage
);

export default ownerRouter;
