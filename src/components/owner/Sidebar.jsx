import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { useAppContext } from "../../context/Appcontext";
import {
  LayoutDashboard,
  PlusCircle,
  Car,
  CalendarCheck,
  Wallet,
  Wrench,
  Store,
  DollarSign, // ✅ NEW
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { user, axios, fetchUser, repairs, isOwner } = useAppContext();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Notification Logic: Count pending repairs for the owner
  const pendingCount = repairs.filter((r) => r.status === "Pending").length;

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
    if (!image) return toast.error("Please select an image");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      const { data } = await axios.post("/api/owner/update-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success("Image updated successfully");
        await fetchUser();
        setImage(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center justify-between py-2.5 px-4 rounded-xl transition-all ${
      isActive
        ? "bg-indigo-600 text-white shadow-md font-semibold"
        : "text-gray-600 hover:bg-indigo-50"
    }`;

  return (
    <aside className="w-64 bg-white min-h-screen p-4 flex flex-col items-center border-r border-gray-200 sticky top-0">
      {/* --- Profile Section --- */}
      <div className="mb-8 flex flex-col items-center pt-4">
        <label
          htmlFor="sidebar-image-upload"
          className="relative cursor-pointer group"
        >
          <img
            src={preview || user?.image || assets.default_avatar}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlusCircle size={20} className="text-white" />
          </div>
        </label>
        <input
          id="sidebar-image-upload"
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setImage(e.target.files[0])}
        />

        {image && (
          <button
            onClick={updateImage}
            disabled={loading}
            className="mt-2 text-xs bg-indigo-600 text-white px-3 py-1 rounded-full"
          >
            {loading ? "..." : "Save"}
          </button>
        )}
        <p className="font-bold mt-3 text-gray-800 tracking-tight">
          {user?.name || "Owner"}
        </p>
       
      </div>

      {/* --- Navigation Menu --- */}
      <ul className="w-full space-y-2 flex-1">
        <li>
          <NavLink to="/owner" end className={linkClasses}>
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} />
              <span className="font-medium">Dashboard</span>
            </div>
          </NavLink>
        </li>

        <li>
          <NavLink to="/owner/add-car" className={linkClasses}>
            <div className="flex items-center gap-3">
              <PlusCircle size={18} />
              <span className="font-medium">Add Car</span>
            </div>
          </NavLink>
        </li>

        <li>
          <NavLink to="/owner/manage-cars" className={linkClasses}>
            <div className="flex items-center gap-3">
              <Car size={18} />
              <span className="font-medium">Manage Cars</span>
            </div>
          </NavLink>
        </li>

        <li>
          <NavLink to="/owner/manage-bookings" className={linkClasses}>
            <div className="flex items-center gap-3">
              <CalendarCheck size={18} />
              <span className="font-medium">Manage Bookings</span>
            </div>
          </NavLink>
        </li>

        <li>
          <NavLink to="/owner/finance" className={linkClasses}>
            <div className="flex items-center gap-3">
              <Wallet size={18} />
              <span className="font-medium">Finance Summary</span>
            </div>
          </NavLink>
        </li>

        {/* ✅ Manage Shops Link */}
        <li>
          <NavLink to="/owner/manage-shops" className={linkClasses}>
            <div className="flex items-center gap-3">
              <Store size={18} />
              <span className="font-medium">Manage Shops</span>
            </div>
          </NavLink>
        </li>

        {/* ✅ Repair Management Link with Notification Badge */}
        <li>
          <NavLink to="/owner/repairs" className={linkClasses}>
            <div className="flex items-center gap-3">
              <Wrench size={18} />
              <span className="font-medium">Repair Management</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </NavLink>
        </li>

        {/* ✅ NEW: Subscriptions Link */}
        <li>
          <NavLink to="/owner/subscriptions" className={linkClasses}>
            <div className="flex items-center gap-3">
              <DollarSign size={18} />
              <span className="font-medium">Subscriptions</span>
            </div>
          </NavLink>
        </li>
      </ul>

      {/* --- Bottom Section --- */}
      <div className="w-full pt-4 border-t border-gray-100">
        <Link
          to="/"
          className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Back to Website</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
