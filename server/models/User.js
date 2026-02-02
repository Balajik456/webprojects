// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: String,
//     password: String,
//     role: {
//       type: String,
//       enum: ["user", "owner"],
//       default: "user",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);


import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "owner"],
      default: "user",
    },

    image: {
      type: String, // 🔥 stores ImageKit URL
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
