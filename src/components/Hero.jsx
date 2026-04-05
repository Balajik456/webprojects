import React, { useState } from "react";
import { assets, cityList } from "../assets/assets";
import { useAppContext } from "../context/Appcontext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState("");

  // Using global state for functionality
  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate } =
    useAppContext();

  // Get today's date for minimum date validation
  const today = new Date().toISOString().split("T")[0];

  const handleSearch = (e) => {
    e.preventDefault();

    // ✅ FIXED: Better validation - check each field separately
    if (!pickupLocation || pickupLocation.trim() === "") {
      toast.error("Please select a pickup location");
      return;
    }

    if (!pickupDate || pickupDate === "") {
      toast.error("Please select a pickup date");
      return;
    }

    if (!returnDate || returnDate === "") {
      toast.error("Please select a return date");
      return;
    }

    // ✅ Additional validation: Return date should be after pickup date
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    if (returnD <= pickup) {
      toast.error("Return date must be after pickup date");
      return;
    }

    // Navigate to the search results page
    navigate(
      `/cars?location=${encodeURIComponent(pickupLocation)}&pickup=${pickupDate}&return=${returnDate}`,
    );
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-10 bg-light text-center overflow-hidden px-4">
      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl md:text-5xl font-semibold text-gray-800"
      >
        Luxury cars on Rent
      </motion.h1>

      {/* Search Form */}
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        whileHover={{ shadow: "0px 10px 30px rgba(0,0,0,0.15)" }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-[800px] bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] z-10"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10 md:ml-8 w-full">
          {/* Location Dropdown */}
          <div className="flex flex-col items-start gap-2">
            <select
              className="outline-none bg-transparent cursor-pointer font-normal text-gray-700"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            >
              <option value="">Pickup Location</option>
              {cityList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <p className="px-1 text-sm text-gray-500">
              {pickupLocation ? pickupLocation : "Please Select Location"}
            </p>
          </div>

          {/* Pickup Date */}
          <div className="flex flex-col items-start gap-2">
            <label className="text-gray-600 text-sm" htmlFor="pickup-date">
              Pickup Date
            </label>
            <input
              type="date"
              id="pickup-date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={today}
              className="text-sm text-gray-500 outline-none cursor-pointer"
            />
          </div>

          {/* Return Date */}
          <div className="flex flex-col items-start gap-2">
            <label className="text-gray-600 text-sm" htmlFor="return-date">
              Return Date
            </label>
            <input
              type="date"
              id="return-date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate || today}
              className="text-sm text-gray-500 outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Search Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-2 px-9 py-3 max-sm:mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition-colors shadow-lg"
        >
          <img
            src={assets.search_icon}
            alt="search"
            className="brightness-200 h-4"
          />
          Search
        </motion.button>
      </motion.form>

      {/* Main Car Image with Floating Animation */}
      <motion.div
        initial={{ x: 500, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, type: "spring", stiffness: 50 }}
        className="relative"
      >
        <motion.img
          src={assets.main_car}
          alt="car"
          className="max-h-74 drop-shadow-2xl"
          animate={{ y: [0, -15, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

export default Hero;
