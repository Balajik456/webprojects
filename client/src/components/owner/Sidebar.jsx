// // import React, { useState } from "react";
// // import { assets, ownerMenuLinks } from "../../assets/assets";
// // import { Link, NavLink, useLocation } from "react-router-dom";
// // import { useAppContext } from "../../context/Appcontext";
// // import toast from "react-hot-toast";

// // const Sidebar = () => {
// //   const { user, axios, fetchUser } = useAppContext();
// //   const location = useLocation();

// //   const [image, setImage] = useState(null);

// //   // Update user image
// //   const updateImage = async () => {
// //     if (!image) return toast.error("Please select an image");

// //     try {
// //       const formData = new FormData();
// //       formData.append("image", image);

// //       const { data } = await axios.post("/api/owner/update-image", formData, {
// //         headers: {
// //           "Content-Type": "multipart/form-data",
// //         },
// //       });

// //       if (data.success) {
// //         toast.success(data.message);
// //         fetchUser();
// //         setImage(null); // ✅ FIXED
// //       } else {
// //         toast.error(data.message);
// //       }
// //     } catch (error) {
// //       toast.error(error.response?.data?.message || error.message);
// //     }
// //   };

// //   return (
// //     <aside className="w-64 bg-gray-100 min-h-screen p-4 flex flex-col items-center">
// //       {/* Profile Image */}
// //       <div className="relative group mb-4">
// //         <label htmlFor="image-upload" className="cursor-pointer">
// //           <img
// //             src={
// //               image
// //                 ? URL.createObjectURL(image)
// //                 : user?.image 
// //             }
// //             alt="Profile"
// //             className="w-24 h-24 rounded-full object-cover border border-gray-300"
// //           />

// //           <input
// //             type="file"
// //             id="image-upload"
// //             accept="image/*"
// //             hidden
// //             onChange={(e) => setImage(e.target.files[0])}
// //           />

// //           {/* Hover edit icon */}
// //           <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
// //             <img src={assets.edit_icon} alt="edit" className="w-6 h-6" />
// //           </div>
// //         </label>

// //         {/* Save button */}
// //         {image && (
// //           <button
// //             onClick={updateImage}
// //             className="mt-2 px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 text-sm"
// //           >
// //             Save
// //             <img src={assets.check_icon} alt="check" className="w-3 h-3" />
// //           </button>
// //         )}
// //       </div>

// //       {/* Owner Name */}
// //       <p className="text-base font-semibold mb-4">{user?.name || "Owner"}</p>

// //       {/* Menu Links */}
// //       <ul className="w-full space-y-2">
// //         {ownerMenuLinks.map((link, index) => (
// //           <li key={index}>
// //             <NavLink
// //               to={link.path}
// //               className={({ isActive }) =>
// //                 `flex items-center gap-2 w-full py-2 px-3 rounded ${
// //                   isActive
// //                     ? "bg-blue-100 text-blue-600 font-bold"
// //                     : "text-gray-700"
// //                 }`
// //               }
// //             >
// //               <img
// //                 src={
// //                   location.pathname === link.path ? link.coloredIcon : link.icon
// //                 }
// //                 alt={link.name}
// //                 className="w-5 h-5"
// //               />
// //               <span>{link.name}</span>
// //             </NavLink>
// //           </li>
// //         ))}
// //         <li>
// //           <Link
// //             to="/"
// //             className="block py-2 px-3 text-gray-700 hover:bg-gray-200 rounded"
// //           >
// //             Back to Website
// //           </Link>
// //         </li>
// //       </ul>
// //     </aside>
// //   );
// // };

// // export default Sidebar;
// import React, { useEffect, useState } from "react";
// import { assets, ownerMenuLinks } from "../../assets/assets";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import { useAppContext } from "../../context/Appcontext";
// import toast from "react-hot-toast";

// const Sidebar = () => {
//   const { user, loading, axios, fetchUser } = useAppContext();
//   const location = useLocation();

//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState(null);

//   // Create preview URL safely
//   useEffect(() => {
//     if (!image) {
//       setPreview(null);
//       return;
//     }

//     const objectUrl = URL.createObjectURL(image);
//     setPreview(objectUrl);

//     return () => URL.revokeObjectURL(objectUrl);
//   }, [image]);

//   // Update user image
//   const updateImage = async () => {
//     if (!image) return toast.error("Please select an image");

//     try {
//       const formData = new FormData();
//       formData.append("image", image);

//       const { data } = await axios.post(
//         "/api/owner/update-image",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       if (data.success) {
//         toast.success(data.message);
//         await fetchUser(); // 🔥 ensure fresh image
//         setImage(null);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || error.message);
//     }
//   };

//   // 🔒 Prevent render until user is loaded
//   if (loading) {
//     return (
//       <aside className="w-64 min-h-screen flex items-center justify-center bg-gray-100">
//         Loading...
//       </aside>
//     );
//   }

//   return (
//     <aside className="w-64 bg-gray-100 min-h-screen p-4 flex flex-col items-center">
//       {/* Profile Image */}
//       <div className="relative group mb-4">
//         <label htmlFor="image-upload" className="cursor-pointer">
//           <img
//             src={preview || user?.image || assets.default_avatar}
//             alt="Profile"
//             className="w-24 h-24 rounded-full object-cover border border-gray-300"
//           />

//           <input
//             type="file"
//             id="image-upload"
//             accept="image/*"
//             hidden
//             onChange={(e) => setImage(e.target.files[0])}
//           />

//           {/* Hover edit icon */}
//           <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
//             <img src={assets.edit_icon} alt="edit" className="w-6 h-6" />
//           </div>
//         </label>

//         {/* Save button */}
//         {image && (
//           <button
//             onClick={updateImage}
//             className="mt-2 px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-1 text-sm"
//           >
//             Save
//             <img src={assets.check_icon} alt="check" className="w-3 h-3" />
//           </button>
//         )}
//       </div>

//       {/* Owner Name */}
//       <p className="text-base font-semibold mb-4">
//         {user?.name || "Owner"}
//       </p>

//       {/* Menu Links */}
//       <ul className="w-full space-y-2">
//         {ownerMenuLinks.map((link, index) => (
//           <li key={index}>
//             <NavLink
//               to={link.path}
//               className={({ isActive }) =>
//                 `flex items-center gap-2 w-full py-2 px-3 rounded ${
//                   isActive
//                     ? "bg-blue-100 text-blue-600 font-bold"
//                     : "text-gray-700"
//                 }`
//               }
//             >
//               <img
//                 src={
//                   location.pathname === link.path
//                     ? link.coloredIcon
//                     : link.icon
//                 }
//                 alt={link.name}
//                 className="w-5 h-5"
//               />
//               <span>{link.name}</span>
//             </NavLink>
//           </li>
//         ))}

//         <li>
//           <Link
//             to="/"
//             className="block py-2 px-3 text-gray-700 hover:bg-gray-200 rounded"
//           >
//             Back to Website
//           </Link>
//         </li>
//       </ul>
//     </aside>
//   );
// };

// export default Sidebar;

import React, { useEffect, useState } from "react";
import { assets, ownerMenuLinks } from "../../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { useAppContext } from "../../context/Appcontext";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { user, axios, fetchUser } = useAppContext();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Preview handling (no memory leak)
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const updateImage = async () => {
    if (!image) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const { data } = await axios.post(
        "/api/owner/update-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!data.success) {
        toast.error(data.message);
        setLoading(false);
        return;
      }

      toast.success("Image updated successfully");

      // IMPORTANT
      await fetchUser();   // wait until user updates
      setImage(null);      // reset file input
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-64 bg-gray-100 min-h-screen p-4 flex flex-col items-center">
      {/* PROFILE IMAGE */}
      <div className="mb-4 flex flex-col items-center">
        <label htmlFor="image-upload" className="relative cursor-pointer group">
          <img
            src={preview || user?.image || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border"
          />
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <img src={assets.edit_icon} alt="edit" className="w-6 h-6" />
          </div>
        </label>

        <input
          id="image-upload"
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setImage(e.target.files[0])}
        />

        {image && (
          <button
            onClick={updateImage}
            disabled={loading}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        )}
      </div>

      {/* NAME */}
      <p className="font-semibold mb-4">{user?.name || "Owner"}</p>

      {/* MENU */}
      <ul className="w-full space-y-2">
        {ownerMenuLinks.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 py-2 px-3 rounded ${
                  isActive
                    ? "bg-blue-100 text-blue-600 font-bold"
                    : "text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <img
                    src={isActive ? link.coloredIcon : link.icon}
                    alt={link.name}
                    className="w-5 h-5"
                  />
                  <span>{link.name}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}

        <li>
          <Link
            to="/"
            className="block py-2 px-3 rounded text-gray-700 hover:bg-gray-200"
          >
            Back to Website
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;