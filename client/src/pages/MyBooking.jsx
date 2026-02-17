import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import { useAppContext } from "../context/Appcontext";
import toast from "react-hot-toast";
import { motion } from "motion/react";

const MyBooking = () => {
  const { axios, user, currency } = useAppContext();
  const [bookings, setBookings] = useState([]);

  // ✅ Logic: Fetches only the bookings belonging to the logged-in user
  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/user");
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch bookings");
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  return (
    <motion.div
      className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl mx-auto"
      initial={{ y: 30, opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title
        title="My Bookings"
        subTitle="View and manage your all car bookings"
        align="left"
      />

      <div className="mt-10">
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              key={booking._id}
              className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6 border border-gray-100 shadow-sm rounded-xl mb-6 bg-white"
            >
              {/* ✅ Car Info Column - Uses optional chaining to prevent crash */}
              <div className="md:col-span-1">
                <div className="rounded-lg overflow-hidden mb-3 bg-gray-100 aspect-video">
                  <img
                    src={booking.car?.image || assets.default_car_placeholder}
                    alt={booking.car?.model}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-lg font-bold text-gray-800 uppercase tracking-tight">
                  {booking.car?.brand} {booking.car?.model}
                </p>
                <p className="text-gray-400 text-xs font-medium">
                  {booking.car?.year} · {booking.car?.category}
                </p>
              </div>

              {/* ✅ Booking Details Column */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <p className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md font-bold text-[10px] uppercase">
                    Booking #{index + 1}
                  </p>

                  {/* ✅ Concept: Status updated by admin */}
                  <p
                    className={`px-3 py-1 text-[10px] rounded-full font-black uppercase tracking-widest ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {booking.status}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={assets.calendar_icon_colored}
                      className="w-4 h-4 mt-0.5"
                      alt="calendar"
                    />
                    <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase">
                        Rental period
                      </p>
                      <p className="text-gray-700 font-medium">
                        {new Date(booking.pickupDate).toLocaleDateString()} —{" "}
                        {new Date(booking.returnDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={assets.location_icon}
                      className="w-4 h-4 mt-0.5"
                      alt="location"
                    />
                    <div>
                      <p className="text-gray-400 text-[10px] font-bold uppercase">
                        Pickup location
                      </p>
                      <p className="text-gray-700 font-medium">
                        {booking.car?.location || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Price Column */}
              <div className="md:col-span-1 flex flex-col justify-center items-end border-l border-gray-50 pl-6">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Total Paid
                </p>
                <h1 className="text-3xl font-black text-gray-900">
                  {currency}
                  {booking.price}
                </h1>
                <p className="text-[10px] text-gray-400 mt-2 font-medium">
                  Ref: {booking._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium italic">
              You haven't made any bookings yet.
            </p>
            <button
              onClick={() => navigate("/cars")}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Browse Available Cars
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyBooking;
