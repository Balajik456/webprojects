import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/Appcontext";
import toast from "react-hot-toast";

const Dashboardcards = () => {
  const { axios, isOwner, currency } = useAppContext();

  const defaultDashboardData = {
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  };

  const [data, setData] = useState(defaultDashboardData);

  const fetchDashboardData = async () => {
    try {
      // ✅ FIX 1: Point to the CORRECT Backend URL
      const res = await axios.get("/api/bookings/dashboard");

      if (res.data.success) {
        // ✅ FIX 2: Correctly map the 'stats' object from the backend
        setData({
          totalCars: res.data.stats.totalCars,
          totalBookings: res.data.stats.totalBookings,
          pendingBookings: res.data.stats.pendingBookings,
          confirmedBookings: res.data.stats.confirmedBookings,
          monthlyRevenue: res.data.stats.monthlyRevenue,
          recentBookings: res.data.recentBookings,
        });
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData();
    }
  }, [isOwner]);

  const dashboardCards = [
    {
      title: "Total Cars",
      value: data.totalCars || 0,
      icon: assets.car_icon,
    },
    {
      title: "Total Bookings",
      value: data.totalBookings || 0,
      icon: assets.listIconColored,
    },
    {
      title: "Pending",
      value: data.pendingBookings || 0,
      icon: assets.cautionIconColored,
    },
    {
      title: "Confirmed",
      value: data.confirmedBookings || 0,
      icon: assets.listIconColored,
    },
  ];

  return (
    <div className="px-4 pt-10 md:px-10 flex-1">
      <Title
        title="Admin Dashboard"
        subTitle="Monitor overall platform performance including total cars, bookings, revenue and recent activities"
      />

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor bg-white shadow-sm"
          >
            <div>
              <h1 className="text-sm text-gray-500">{card.title}</h1>
              <p className="text-2xl font-semibold mt-1">{card.value}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
              <img src={card.icon} alt="" className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6 mb-8 w-full">
        {/* Recent Bookings Table */}
        <div className="p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full bg-white">
          <h1 className="text-lg font-medium">Recent Bookings</h1>
          <p className="text-gray-500 text-sm mb-4">Latest customer bookings</p>

          {!data.recentBookings || data.recentBookings.length === 0 ? (
            <p className="text-sm text-gray-400 mt-4 text-center py-4">
              No recent bookings found
            </p>
          ) : (
            data.recentBookings.map((booking, index) => (
              <div
                key={index}
                className="mt-4 flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center justify-center w-10 h-10 rounded bg-gray-100 overflow-hidden">
                    <img
                      src={booking.car?.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {booking.car?.brand} {booking.car?.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.createdAt
                        ? booking.createdAt.split("T")[0]
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {currency} {booking.price}
                  </p>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : booking.status === "confirmed"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Monthly Revenue Card */}
        <div className="p-4 md:p-6 mb-6 border border-borderColor rounded-md w-full md:max-w-xs bg-white">
          <h1 className="text-lg font-medium">Monthly Revenue</h1>
          <p className="text-gray-500 text-sm">Revenue for current Month</p>
          <p className="text-3xl mt-6 font-semibold text-blue-600">
            {currency} {data.monthlyRevenue}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboardcards;
