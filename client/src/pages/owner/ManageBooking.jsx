import React, { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/Appcontext";
import toast from "react-hot-toast";

const ManageBooking = () => {
  const { currency, axios } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/bookings/owner");
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post("/api/bookings/status", {
        bookingId,
        status,
      });

      if (data.success) {
        toast.success(`✅ Booking ${status}!`);

        // Update the bookings state immediately
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId ? { ...booking, status } : booking,
          ),
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <Title
        title="Manage Bookings"
        subTitle="Track all customer bookings, approve or cancel requests, and manage the booking status"
      />

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No bookings yet</div>
      ) : (
        <div className="border border-gray-200 rounded-2xl overflow-hidden mt-6 bg-white">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
            <div className="col-span-3">Car</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price Per Day</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition"
              >
                {/* Car Info with Image */}
                <div className="col-span-3 flex items-center gap-3">
                  <img
                    src={booking.car?.image}
                    alt={booking.car?.model}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {booking.car?.brand} {booking.car?.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      • {booking.car?.transmission}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2">
                  <p className="text-gray-600">{booking.car?.category}</p>
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <p className="text-gray-800 font-semibold">
                    {currency} {booking.price}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="col-span-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex gap-2">
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          changeBookingStatus(booking._id, "confirmed")
                        }
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          changeBookingStatus(booking._id, "cancelled")
                        }
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {booking.status === "confirmed" && (
                    <span className="text-gray-400 text-sm italic">
                      Approved
                    </span>
                  )}

                  {booking.status === "cancelled" && (
                    <span className="text-gray-400 text-sm italic">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooking;
