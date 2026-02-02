// import fs from "fs";
// import imagekit from "../configs/imagekit.js";
// import Car from "../models/Car.js";
// import User from "../models/User.js";
// import Booking from "../models/Booking.js";

// export const changeRoleToOwner = async (req, res) => {
//   await User.findByIdAndUpdate(req.user._id, { role: "owner" });
//   res.json({ success: true, message: "Now you can list cars" });
// };

// export const addCar = async (req, res) => {
//   if (!req.file || !req.body.carData) {
//     return res.status(400).json({ success: false, message: "Invalid data" });
//   }

//   const car = JSON.parse(req.body.carData);
//   const fileBuffer = fs.readFileSync(req.file.path);

//   const upload = await imagekit.upload({
//     file: fileBuffer,
//     fileName: req.file.originalname,
//     folder: "cars",
//   });

//   fs.unlinkSync(req.file.path);

//   const newCar = await Car.create({
//     ...car,
//     image: upload.url,
//     owner: req.user._id,
//   });

//   res.status(201).json({ success: true, car: newCar });
// };

// export const getOwnerCars = async (req, res) => {
//   const cars = await Car.find({ owner: req.user._id });
//   res.json({ success: true, cars });
// };

// export const toggleCarAvailability = async (req, res) => {
//   const { carId } = req.body;
//   const car = await Car.findById(carId);

//   if (!car || car.owner.toString() !== req.user._id.toString()) {
//     return res.json({ success: false, message: "Unauthorized" });
//   }

//   car.isAvailable = !car.isAvailable;
//   await car.save();

//   res.json({ success: true, message: "Availability toggled" });
// };

// export const Deletecar = async (req, res) => {
//   const { carId } = req.body;
//   await Car.findByIdAndDelete(carId);
//   res.json({ success: true, message: "Car removed" });
// };

// export const getDashboardData = async (req, res) => {
//   if (req.user.role !== "owner") {
//     return res.json({ success: false, message: "Unauthorized" });
//   }

//   const cars = await Car.find({ owner: req.user._id });
//   const bookings = await Booking.find({ owner: req.user._id }).populate("car");

//   const dashboard = {
//     totalCars: cars.length,
//     totalBookings: bookings.length,
//   };

//   res.json({ success: true, dashboard });
// };

// export const updateUserImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.json({ success: false, message: "No image uploaded" });
//     }

//     // ✅ Upload using file path
//     const uploadResponse = await imagekit.upload({
//       file: fs.readFileSync(req.file.path),
//       fileName: req.file.filename,
//       folder: "users",
//     });

//     // ✅ Save URL to DB
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { image: uploadResponse.url },
//       { new: true }
//     );

//     // ✅ Remove local file after upload
//     fs.unlinkSync(req.file.path);

//     res.json({
//       success: true,
//       message: "Profile image updated",
//       image: user.image,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// export const deleteCar = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const car = await Car.findById(id);

//     if (!car) {
//       return res.status(404).json({
//         success: false,
//         message: "Car not found",
//       });
//     }

//     await car.deleteOne();

//     res.json({
//       success: true,
//       message: "Car deleted successfully",
//     });
//   } catch (error) {
//     console.error("DELETE CAR ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
import imagekit from "../configs/imagekit.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

/* ================= CHANGE ROLE ================= */
export const changeRoleToOwner = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { role: "owner" });
  res.json({ success: true, message: "Now you can list cars" });
};

/* ================= ADD CAR ================= */
export const addCar = async (req, res) => {
  try {
    if (!req.file || !req.body.carData) {
      return res.status(400).json({
        success: false,
        message: "Image or car data missing",
      });
    }

    const car = JSON.parse(req.body.carData);

    // ✅ Validate priceperday
    if (!car.priceperday) {
      return res.status(400).json({
        success: false,
        message: "priceperday is required",
      });
    }

    const upload = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "cars",
    });

    const newCar = await Car.create({
      ...car,
      image: upload.url,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Car added successfully",
      car: newCar,
    });
  } catch (error) {
    console.error("ADD CAR ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET OWNER CARS ================= */
export const getOwnerCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id });
    res.json({ success: true, cars });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= TOGGLE AVAILABILITY ================= */
export const toggleCarAvailability = async (req, res) => {
  const { carId } = req.body;

  const car = await Car.findById(carId);

  if (!car || car.owner.toString() !== req.user._id.toString()) {
    return res.json({ success: false, message: "Unauthorized" });
  }

  car.isAvailable = !car.isAvailable;
  await car.save();

  res.json({ success: true, message: "Availability toggled" });
};

/* ================= DELETE CAR ================= */
export const deleteCar = async (req, res) => {
  const { carId } = req.body;

  const car = await Car.findOne({
    _id: carId,
    owner: req.user._id,
  });

  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }

  await Car.deleteOne({ _id: carId });

  res.json({
    success: true,
    message: "Car deleted successfully",
  });
};




/* ================= DASHBOARD ================= */
export const getDashboardData = async (req, res) => {
  if (req.user.role !== "owner") {
    return res.json({ success: false, message: "Unauthorized" });
  }

  const cars = await Car.find({ owner: req.user._id });
  const bookings = await Booking.find({ owner: req.user._id }).populate("car");

  res.json({
    success: true,
    dashboard: {
      totalCars: cars.length,
      totalBookings: bookings.length,
    },
  });
};

/* ================= UPDATE USER IMAGE ================= */
export const updateUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "No image uploaded" });
    }

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer, // ✅ FIX
      fileName: req.file.originalname,
      folder: "users",
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { image: uploadResponse.url },
      { new: true }
    );

    res.json({
      success: true,
      message: "Profile image updated",
      image: user.image,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
