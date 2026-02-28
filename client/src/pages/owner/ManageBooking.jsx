import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/Appcontext";
import toast from "react-hot-toast";

const ManageBooking = () => {
  const { currency, axios } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true);
      console.log("Fetching bookings from /api/bookings/owner");

      const { data } = await axios.get("/api/bookings/owner");

      console.log("Response:", data);

      if (data.success) {
        setBookings(data.bookings || []);
        console.log("Bookings loaded:", data.bookings.length);
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
      console.log("Changing status:", { bookingId, status });

      const { data } = await axios.post("/api/bookings/status", {
        bookingId,
        status,
      });

      if (data.success) {
        toast.success(data.message || `Booking ${status}!`);
        fetchOwnerBookings();
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
        <h1 className="text-2xl font-bold mb-2">Manage Bookings</h1>
        <p className="text-gray-600 mb-6">Track and manage customer bookings</p>
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <h1 className="text-2xl font-bold mb-2">Manage Bookings</h1>
      <p className="text-gray-600 mb-6">
        Track all customer bookings, approve or cancel requests, and manage the
        booking status
      </p>

      {bookings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg mt-6">
          <p className="text-gray-400 text-lg">No bookings found</p>
          <p className="text-gray-300 text-sm mt-2">
            Bookings will appear here when customers make requests
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Car
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 max-md:hidden">
                    Date Range
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700 max-md:hidden">
                    Status
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr
                    key={booking._id || index}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {/* Car Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {booking.car?.image && (
                          <img
                            src={booking.car.image}
                            alt={booking.car?.brand}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">
                            {booking.car?.brand || "Unknown"}{" "}
                            {booking.car?.model || ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            {booking.car?.category || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4">
                      <p className="font-medium text-gray-800">
                        {booking.user?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.user?.email || ""}
                      </p>
                    </td>

                    {/* Date Range */}
                    <td className="p-4 max-md:hidden text-gray-600">
                      <p className="text-xs">
                        {booking.pickupDate
                          ? new Date(booking.pickupDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p className="text-xs text-gray-400">to</p>
                      <p className="text-xs">
                        {booking.returnDate
                          ? new Date(booking.returnDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <p className="font-bold text-gray-800">
                        {currency} {booking.price || 0}
                      </p>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 max-md:hidden">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status || "pending"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      {booking.status === "pending" ? (
                        <select
                          onChange={(e) =>
                            changeBookingStatus(booking._id, e.target.value)
                          }
                          value={booking.status}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md outline-none cursor-pointer hover:border-indigo-500 focus:border-indigo-500 transition"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          {booking.status === "confirmed"
                            ? "Approved"
                            : "Closed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border">
        <p className="text-sm text-gray-600">
          Total Bookings:{" "}
          <span className="font-bold text-gray-800">{bookings.length}</span>
        </p>
      </div>
    </div>
  );
};

export default ManageBooking;
