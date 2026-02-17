import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/Appcontext";
import { Wrench, CheckCircle, Clock, DollarSign } from "lucide-react";

const RepairDashboard = () => {
  const { axios, currency } = useAppContext();
  const [stats, setStats] = useState({
    totalRepairs: 0,
    pendingRepairs: 0,
    completedRepairs: 0,
    totalEarnings: 0,
  });

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("/api/repair/stats");
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Service Center Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Repairs Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Requests</p>
            <h2 className="text-3xl font-bold">{stats.totalRepairs}</h2>
          </div>
          <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
            <Wrench size={24} />
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Pending Tasks</p>
            <h2 className="text-3xl font-bold">{stats.pendingRepairs}</h2>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
            <Clock size={24} />
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Completed</p>
            <h2 className="text-3xl font-bold">{stats.completedRepairs}</h2>
          </div>
          <div className="bg-green-100 p-3 rounded-lg text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Earnings</p>
            <h2 className="text-3xl font-bold">
              {currency}
              {stats.totalEarnings}
            </h2>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <DollarSign size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairDashboard;
