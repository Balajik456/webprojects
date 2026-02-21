import React, { useState } from "react";
import { assets, menuLinks } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/Appcontext";
import toast from "react-hot-toast";
import { motion } from "motion/react";

const Navbar = () => {
  const { setShowLogin, user, logout } = useAppContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between p-6 bg-transparent text-gray-700"
    >
      <NavLink to="/">
        <motion.img
          whileHover={{ scale: 1.05 }}
          src={assets.logo}
          alt="logo"
          className="h-8"
        />
      </NavLink>

      <div
        className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16
        max-sm:border-t max-sm:border-gray-200 right-0 flex flex-col sm:flex-row
        items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 max-sm:bg-white
        transition-all duration-300 z-50
        ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}
      >
        {menuLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              `transition-colors ${
                isActive
                  ? "text-indigo-600 font-medium"
                  : "text-gray-700 hover:text-indigo-600"
              }`
            }
            onClick={() => setOpen(false)}
          >
            {link.name}
          </NavLink>
        ))}

        {/* ✅ Join as Mechanic Button */}
        <NavLink
          to="/mechanic/subscribe"
          onClick={() => setOpen(false)}
          className="text-sm font-medium text-indigo-600 border border-indigo-600 px-4 py-1.5 rounded-lg hover:bg-indigo-50 transition whitespace-nowrap"
        >
        Mechanic shop owner
        </NavLink>

        <div className="flex gap-4 items-center">
          {user && (
            <button
              onClick={() => navigate("/owner")}
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              Dashboard
            </button>
          )}

          <button
            onClick={() => {
              user ? logout() : setShowLogin(true);
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </div>

      <button className="sm:hidden" onClick={() => setOpen(!open)}>
        <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
      </button>
    </motion.div>
  );
};

export default Navbar;
