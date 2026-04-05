// import User from "../models/User.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import Cars from "../../client/src/pages/Cars.jsx";
// import Car from "../models/Car.js";

// const generateToken = (userId) => {
//   const pay = userId
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET,{ expiresIn: "7d" });
// };

// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password || password.length < 8) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields required, password min 8 chars",
//       });
//     }

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(409).json({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ name, email, password: hashedPassword });

//     const token = generateToken(user._id.toString());

//     return res.status(201).json({ success: true, token });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res
//         .status(401)
//         .json({ success: false, message: "User not found" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid credentials" });
//     }

//     const token = generateToken(user._id);
//     return res.status(200).json({ success: true, token });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };
// //get user data
// export const getUserData = async(req,res) =>{
//   try {
//       const{user}=req;
//       res.json({success:true,user})
//   } catch (error) {
//     console.log(error.message);
//      return res.status(500).json({ success: false, message: error.message });
//   }
// }
// //get all user car for frontend
// export const getCars = async (req, res) => {
//   try {
//    const cars = Car.find({isAvailable:true})
//    return res.status(500).json({ success: true, cars });
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Car from "../models/Car.js";

// TOKEN GENERATOR
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "All fields required, password min 8 chars",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(user._id.toString());
    return res.status(201).json({ success: true, token });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN (Email OR Username)
export const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // 🔹 Check by email or username
    const user = await User.findOne({
      $or: [{ email: email || "" }, { name: username || "" }],
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET USER DATA
export const getUserData = async (req, res) => {
  try {
    const { user } = req;
    res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL CARS FOR FRONTEND
export const getCars = async (req, res) => {
  const cars = await Car.find({ isAvailable: true });
  res.json({ success: true, cars });
};

