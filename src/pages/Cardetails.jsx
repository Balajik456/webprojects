import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Loader from "../components/Loader";
import { useAppContext } from "../context/Appcontext";
import toast from "react-hot-toast";
import { motion } from "motion/react";

const Cardetails = () => {
  const { id } = useParams();
  const { cars, axios, user, setShowLogin } = useAppContext();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const currency = import.meta.env.VITE_CURRENCY || "₹"; // Default to ₹ if env missing

  // ✅ FIX 1: Robust Data Fetching (Context + API Fallback)
  useEffect(() => {
    const fetchCarData = async () => {
      setLoading(true);

      // 1. First, try to find the car in the existing 'cars' context (Instant load)
      if (cars && cars.length > 0) {
        const foundCar = cars.find((c) => c._id === id);
        if (foundCar) {
          setCar(foundCar);
          setLoading(false);
          return;
        }
      }

      // 2. If not found (e.g., page refresh), fetch directly from API
      try {
        const { data } = await axios.get(`/api/car/${id}`);
        if (data.success) {
          setCar(data.car);
        } else {
          toast.error("Car not found");
          navigate("/cars");
        }
      } catch (error) {
        console.error("Error fetching car:", error);
        toast.error("Failed to load car details");
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [id, cars, axios, navigate]);

  // Handle Booking
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      const { data } = await axios.post("/api/bookings/create", {
        car: car._id,
        pickupDate,
        returnDate,
      });

      if (data.success) {
        toast.success("Booking request sent!");
        navigate("/my-bookings");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    }
  };

  if (loading) return <Loader />;

  return car ? (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-10 mb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-500 hover:text-black transition cursor-pointer"
      >
        <img
          src={assets.arrow_icon} // Ensure this icon exists or use a standard SVG
          alt="back"
          className="h-3 rotate-180 opacity-60"
        />
        Back to all cars
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* ================= LEFT COLUMN: Car Details ================= */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          <motion.img
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={car.image}
            alt={car.model}
            className="w-full h-auto max-h-[500px] object-cover rounded-xl mb-6 shadow-md"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold">
                {car.brand} {car.model}
              </h1>
              <p className="text-gray-500 text-lg">
                {car.category} • {car.year}
              </p>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Icons Grid - Fixed Property Names */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FeatureBox
                icon={assets.users_icon}
                text={`${car.seat_capacity} Seats`}
              />
              <FeatureBox icon={assets.fuel_icon} text={car.fuel_type} />
              <FeatureBox icon={assets.car_icon} text={car.transmission} />
              <FeatureBox icon={assets.location_icon} text={car.location} />
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-medium mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {car.description}{" "}
                {/* ✅ Fixed typo: descrption -> description */}
              </p>
            </div>

            {/* Features List */}
            <div>
              <h3 className="text-xl font-medium mb-3">Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "360° Camera",
                  "Bluetooth",
                  "GPS Navigation",
                  "Heated Seats",
                  "Rear View Camera",
                  "Power Mirrors",
                  "Android Auto",
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <img
                      src={assets.check_icon}
                      className="h-4 w-4 mr-2 opacity-70"
                      alt="check"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* ================= RIGHT COLUMN: Booking Form ================= */}
        <div className="lg:col-span-1">
          <motion.form
            initial={{ y: 30, opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleBooking}
            className="shadow-xl border border-gray-100 h-fit sticky top-24 rounded-2xl p-6 space-y-6 bg-white"
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl text-gray-900 font-bold">
                  {currency}
                  {car.priceperday}{" "}
                  {/* ✅ Fixed typo: pricePerDay -> priceperday */}
                </p>
                <p className="text-sm text-gray-400">per day</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Date Inputs */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  min={pickupDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all py-3.5 text-white font-semibold rounded-xl text-lg shadow-lg shadow-blue-200"
            >
              Book Now
            </button>

            <p className="text-center text-xs text-gray-400">
              No credit card required to reserve
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  ) : (
    <Loader />
  );
};

// Helper Component for Icons
const FeatureBox = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition">
    <img src={icon} alt="" className="h-6 w-6 mb-2 opacity-80" />
    <span className="text-sm font-medium text-gray-700 text-center">
      {text}
    </span>
  </div>
);

export default Cardetails;
