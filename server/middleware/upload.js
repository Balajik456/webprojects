// import multer from "multer";

// // Use memory storage (BEST for ImageKit / Cloudinary)
// const storage = multer.memoryStorage();

// // Optional: image-only validation
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files are allowed!"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
// });

// export default upload;


import multer from "multer";

// Use memory storage (BEST for ImageKit / Cloudinary)
const storage = multer.memoryStorage();

// Optional: image-only validation
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
