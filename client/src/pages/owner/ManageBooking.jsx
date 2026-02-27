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
        console.log("Bookings fetched:", data.bookings); // Debug log
        setBookings(data.bookings);
      } else {
        toast.error(data.message || "Failed to load bookings");
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      toast.error(error.response?.data?.message || "Failed to load bookings");
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
        toast.success(data.message || `Booking ${status}!`);
        fetchOwnerBookings(); // Refresh the list
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  if (loading) {
    return (
      <div className="px-4 pt-10 md:px-10 w-full">
        <Title title="Manage Bookings" subTitle="Loading bookings..." />
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <Title
        title="Manage Bookings"
        subTitle="Track all customer bookings, approve or cancel requests, and manage the booking status"
      />

      {bookings.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-lg mt-6">
          <p className="text-gray-400">No bookings found</p>
        </div>
      ) : (
        <div className="max-w-6xl w-full rounded-md overflow-x-auto border border-gray-200 mt-6">
          <table className="w-full border-collapse text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-3 font-medium">Car</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium max-md:hidden">Date Range</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium max-md:hidden">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr
                  key={booking._id || index}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {/* Car Info */}
                  <td className="p-3 flex items-center gap-3">
                    {booking.car?.image && (
                      <img
                        src={booking.car.image}
                        alt={booking.car?.brand}
                        className="h-12 w-12 aspect-square rounded-md object-cover"
                      />
                    )}
                    <div className="max-md:hidden">
                      <p className="font-medium text-gray-800">
                        {booking.car?.brand || "Unknown"}{" "}
                        {booking.car?.model || ""}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.car?.category || ""}
                      </p>
                    </div>
                  </td>

                  {/* Customer Info */}
                  <td className="p-3">
                    <p className="font-medium text-gray-800">
                      {booking.user?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.user?.email || ""}
                    </p>
                  </td>

                  {/* Date Range */}
                  <td className="p-3 max-md:hidden text-gray-600">
                    {booking.pickupDate?.split("T")[0]} to{" "}
                    {booking.returnDate?.split("T")[0]}
                  </td>

                  {/* Price */}
                  <td className="p-3 font-semibold text-gray-800">
                    {currency} {booking.price}
                  </td>

                  {/* Status Badge */}
                  <td className="p-3 max-md:hidden">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-600"
                          : booking.status === "cancelled"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    {booking.status === "pending" ? (
                      <select
                        onChange={(e) =>
                          changeBookingStatus(booking._id, e.target.value)
                        }
                        value={booking.status}
                        className="px-2 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md outline-none cursor-pointer hover:border-indigo-500 focus:border-indigo-500 transition"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        {booking.status === "confirmed" ? "Approved" : "Closed"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageBooking;
