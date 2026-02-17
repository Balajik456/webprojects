import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import Title from "../../components/owner/Title";
import { useAppContext } from "../../context/Appcontext";

const Dashboard = () => {
  const { axios, isOwner, currency } = useAppContext();
  const [data, setData] = useState({
    stats: {
      totalCars: 0,
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      totalRevenue: 0,
    },
    recentBookings: [],
  });

  const fetchDashboardData = async () => {
    try {
      // ✅ Matches the GET route in ownerRouter.js
      const res = await axios.get("/api/owner/dashboard-stats");
      if (res.data.success) {
        setData({
          stats: res.data.stats,
          recentBookings: res.data.recentBookings || [],
        });
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    if (isOwner) fetchDashboardData();
  }, [isOwner]);

  const cards = [
    { title: "Total Cars", value: data.stats.totalCars, icon: assets.car_icon },
    {
      title: "Pending",
      value: data.stats.pendingBookings,
      icon: assets.cautionIconColored,
    },
    {
      title: "Confirmed",
      value: data.stats.confirmedBookings,
      icon: assets.listIconColored,
    },
    {
      title: "Total Revenue",
      value: `${currency}${data.stats.totalRevenue}`,
      icon: assets.listIconColored,
    },
  ];

  return (
    <div className="px-4 pt-10 md:px-10 flex-1 bg-gray-50 min-h-screen">
      <Title
        title="Admin Dashboard"
        subTitle="Monitor car performance and confirmed earnings"
      />

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 my-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex gap-2 items-center justify-between p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <h1 className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                {card.title}
              </h1>
              <p className="text-2xl font-bold mt-1 text-gray-800">
                {card.value}
              </p>
            </div>
            <div className="bg-indigo-50 p-2 rounded-full">
              <img src={card.icon} alt="" className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* ✅ FIXED: Recent Activity Table */}
      <div className="p-4 md:p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">Recent Activity</h1>
        {data.recentBookings.length === 0 ? (
          <p className="text-center py-10 text-gray-400 italic">
            No recent bookings found
          </p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm text-gray-600 border-collapse">
              <thead>
                <tr className="border-b text-gray-400 uppercase text-[10px] tracking-widest">
                  <th className="py-3 px-2">Car</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((booking, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-2 font-medium">
                      {booking.car?.brand} {booking.car?.model}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-gray-400">
                      {booking.createdAt.split("T")[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
