import React, { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/Appcontext";
import toast from "react-hot-toast";

const ManageBooking = () => {
  const { currency, axios } = useAppContext();
  const [bookings, setBookings] = useState([]);

  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get("/api/bookings/owner");
      data.success ? setBookings(data.bookings) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeBookingStatus = async (bookingId, status) => {
    try {
      // ✅ FIX: Changed URL from '/change-status' to '/status' to match your backend route
      const { data } = await axios.post("/api/bookings/status", {
        bookingId,
        status,
      });

      if (data.success) {
        toast.success(data.message);
        fetchOwnerBookings(); // Refresh the list to see the update
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
      <div className="max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6">
        <table className="w-full border-collapse text-left text-sm text-gray-600">
          <thead className="text-gray-500">
            <tr>
              <th className="p-3 font-medium">Car</th>
              <th className="p-3 font-medium max-md:hidden">Date Range</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr
                key={index}
                className="border-t border-borderColor text-gray-500"
              >
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={booking.car.image}
                    alt=""
                    className="h-12 w-12 aspect-square rounded-md object-cover"
                  />
                  <div className="max-md:hidden">
                    <p className="font-medium">
                      {booking.car.brand} {booking.car.model}
                    </p>
                  </div>
                </td>
                <td className="p-3 max-md:hidden">
                  {booking.pickupDate.split("T")[0]} to{" "}
                  {booking.returnDate.split("T")[0]}
                </td>
                <td className="p-3">
                  {currency} {booking.price}/day
                </td>
                <td className="p-3 max-md:hidden">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold 
                    ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>

                <td className="p-3">
                  {booking.status === "pending" ? (
                    <select
                      onChange={(e) =>
                        changeBookingStatus(booking._id, e.target.value)
                      }
                      value={booking.status}
                      className="px-2 py-1.5 mt-1 text-gray-500 border border-borderColor rounded-md outline-none cursor-pointer hover:border-blue-500 transition"
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
    </div>
  );
};

export default ManageBooking;
