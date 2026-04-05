import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/Appcontext";
import toast from "react-hot-toast";

const AdminRepairs = () => {
  const { axios, currency } = useAppContext();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all repairs from the database
  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/repair/all");
      if (data.success) {
        setList(data.repairs);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load repair requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ✅ Solve problem and set the amount
  const handleSolve = async (id) => {
    const amount = prompt("Enter final repair cost (numbers only):");
    if (!amount) return;

    try {
      const { data } = await axios.post("/api/repair/update-status", {
        repairId: id,
        status: "Completed",
        cost: `${currency}${amount}`, // Automatically adds currency symbol
      });
      if (data.success) {
        toast.success("Repair Solved!");
        fetchAll(); // Refresh the list
      }
    } catch (err) {
      toast.error("Update failed: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading customer repairs...
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Manage Customer Repairs
        </h1>
        <p className="text-gray-500">
          View and resolve incoming car repair requests
        </p>
      </div>

      <div className="grid gap-4">
        {list.length > 0 ? (
          list.map((item) => (
            <div
              key={item._id}
              className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-100"
            >
              <div className="space-y-1">
                <p className="font-bold text-indigo-600 text-lg uppercase tracking-tight">
                  {item.car}
                </p>
                <p className="text-gray-700 font-medium">
                  Issue:{" "}
                  <span className="font-normal text-gray-500">
                    {item.issue}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Customer ID: {item.user?._id || item.user || "N/A"}
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    item.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {item.status}
                </span>

                {item.status === "Pending" ? (
                  <button
                    onClick={() => handleSolve(item._id)}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Solve & Set Cost
                  </button>
                ) : (
                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] font-bold uppercase">
                      Final Bill
                    </p>
                    <p className="font-bold text-2xl text-gray-800">
                      {item.cost}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 text-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 italic">
              No repair requests found in the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRepairs;
