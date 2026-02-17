import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/Appcontext";
import { Car, Wrench, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const Finance = () => {
  const { axios, currency } = useAppContext();
  const [stats, setStats] = useState({
    rentalRevenue: 0,
    repairRevenue: 0,
    totalRevenue: 0,
  });

  const fetchFinanceData = async () => {
    try {
      // ✅ Calls the unified route matching ownerRouter.js
      const { data } = await axios.get("/api/owner/dashboard-stats");
      if (data.success) {
        setStats({
          rentalRevenue: data.stats.rentalRevenue,
          repairRevenue: data.stats.repairRevenue,
          totalRevenue: data.stats.totalRevenue,
        });
      }
    } catch (error) {
      toast.error("Failed to load financial data"); //
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Finance Summary</h1>
        <p className="text-gray-500 text-sm">
          Combined earnings from Car Rentals and Repair Services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Net Profit Card */}
        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-indigo-100 font-medium uppercase text-xs">
              Net Profit
            </p>
            <div className="bg-indigo-500 p-2 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <h2 className="text-4xl font-black">
            {currency}
            {stats.totalRevenue}
          </h2>
        </div>

        {/* Rental Income Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-xs font-bold uppercase">
              Rental Income
            </p>
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <Car size={20} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {currency}
            {stats.rentalRevenue}
          </h2>
        </div>

        {/* Repair Income Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-xs font-bold uppercase">
              Repair Income
            </p>
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <Wrench size={20} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {currency}
            {stats.repairRevenue}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Finance;
