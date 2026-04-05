import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/Appcontext";
import { Check, X, Clock, Store, Phone, Mail, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const SubscriptionManagement = () => {
  const { axios } = useAppContext();
  const [pendingShops, setPendingShops] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchPending(), fetchAll()]);
    setLoading(false);
  };

  const fetchPending = async () => {
    try {
      const { data } = await axios.get("/api/subscription/pending");
      if (data.success) {
        setPendingShops(data.shops);
      }
    } catch (err) {
      console.error("fetchPending error:", err);
      toast.error("Failed to load pending subscriptions");
    }
  };

  const fetchAll = async () => {
    try {
      const { data } = await axios.get("/api/subscription/all");
      if (data.success) {
        setAllShops(data.shops);
      }
    } catch (err) {
      console.error("fetchAll error:", err);
      toast.error("Failed to load all subscriptions");
    }
  };

  const approveSubscription = async (shopId, plan) => {
    if (!window.confirm("Approve this subscription?")) return;
    try {
      const { data } = await axios.post("/api/subscription/approve", {
        shopId,
        plan,
      });
      if (data.success) {
        toast.success(data.message);
        loadAll();
      } else {
        toast.error(data.message || "Failed to approve");
      }
    } catch (err) {
      console.error("approve error:", err);
      toast.error("Failed to approve subscription");
    }
  };

  const rejectSubscription = async (shopId, shopName) => {
    if (!window.confirm("Reject subscription for " + shopName + "?")) return;
    try {
      const { data } = await axios.post("/api/subscription/reject", { shopId });
      if (data.success) {
        toast.success("Subscription rejected");
        loadAll();
      } else {
        toast.error(data.message || "Failed to reject");
      }
    } catch (err) {
      console.error("reject error:", err);
      toast.error("Failed to reject subscription");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "active") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "expired") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-500";
  };

  const getDaysLeft = (endDate) => {
    if (!endDate) return null;
    const days = Math.ceil(
      (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return days;
  };

  const getPlanFromPayment = (shop) => {
    if (!shop.paymentHistory || shop.paymentHistory.length === 0)
      return "monthly";
    const last = shop.paymentHistory[shop.paymentHistory.length - 1];
    if (!last || !last.plan) return "monthly";
    const p = last.plan.toLowerCase();
    if (p.includes("annual") || p.includes("year")) return "annual";
    return "monthly";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={
            "px-5 py-2 rounded-lg font-semibold transition text-sm " +
            (activeTab === "pending"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")
          }
        >
          Pending Requests ({pendingShops.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={
            "px-5 py-2 rounded-lg font-semibold transition text-sm " +
            (activeTab === "all"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")
          }
        >
          All Subscriptions ({allShops.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <RefreshCw size={32} className="animate-spin mx-auto mb-2" />
          Loading...
        </div>
      ) : (
        <div>
          {activeTab === "pending" && (
            <div className="space-y-4">
              {pendingShops.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border">
                  <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 font-medium">
                    No pending subscription requests
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    New requests will appear here when mechanics subscribe
                  </p>
                </div>
              ) : (
                pendingShops.map((shop) => {
                  const lastPayment =
                    shop.paymentHistory && shop.paymentHistory.length > 0
                      ? shop.paymentHistory[shop.paymentHistory.length - 1]
                      : null;
                  const plan = getPlanFromPayment(shop);
                  return (
                    <div
                      key={shop._id}
                      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                            <Store size={20} className="text-indigo-600" />
                            {shop.shopName}
                          </h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {shop.ownerName}
                          </p>
                          <p className="text-xs text-gray-400">{shop.city}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          Pending
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={15} className="text-gray-400" />
                          {shop.phoneNumber}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={15} className="text-gray-400" />
                          {shop.email}
                        </div>
                      </div>

                      {lastPayment && (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
                          <p className="text-sm font-semibold text-blue-800 mb-2">
                            Payment Details
                          </p>
                          <div className="grid md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Plan:</span>
                              <span className="font-bold ml-2 capitalize text-gray-800">
                                {lastPayment.plan || plan}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <span className="font-bold ml-2 text-gray-800">
                                Rs.{lastPayment.amount}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Transaction ID:
                              </span>
                              <span className="font-mono ml-2 bg-white px-2 py-0.5 rounded border text-xs text-indigo-700">
                                {lastPayment.transactionId}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Submitted:{" "}
                            {new Date(lastPayment.date).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => approveSubscription(shop._id, plan)}
                          className="flex-1 bg-green-500 text-white py-2.5 px-4 rounded-lg font-bold hover:bg-green-600 transition flex items-center justify-center gap-2"
                        >
                          <Check size={18} />
                          Approve Subscription
                        </button>
                        <button
                          onClick={() =>
                            rejectSubscription(shop._id, shop.shopName)
                          }
                          className="px-5 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition flex items-center gap-1"
                        >
                          <X size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "all" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {allShops.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  No mechanic shops found
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-600">
                        Shop
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-600">
                        Contact
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-600">
                        Plan
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-600">
                        Amount
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-600">
                        Valid Until
                      </th>
                      <th className="p-4 text-left font-semibold text-gray-600">
                        Days Left
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allShops.map((shop) => {
                      const daysLeft = getDaysLeft(shop.subscriptionEndDate);
                      return (
                        <tr
                          key={shop._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="p-4">
                            <p className="font-semibold text-gray-800">
                              {shop.shopName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {shop.ownerName}
                            </p>
                            <p className="text-xs text-gray-400">{shop.city}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-gray-600">{shop.phoneNumber}</p>
                            <p className="text-xs text-gray-400">
                              {shop.email}
                            </p>
                          </td>
                          <td className="p-4 capitalize font-medium text-gray-700">
                            {shop.subscriptionPlan || "None"}
                          </td>
                          <td className="p-4 font-bold text-gray-800">
                            Rs.{shop.subscriptionAmount || 0}
                          </td>
                          <td className="p-4">
                            <span
                              className={
                                "px-3 py-1 rounded-full text-xs font-bold uppercase " +
                                getStatusBadge(shop.subscriptionStatus)
                              }
                            >
                              {shop.subscriptionStatus || "none"}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">
                            {shop.subscriptionEndDate
                              ? new Date(
                                  shop.subscriptionEndDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="p-4">
                            {daysLeft !== null && daysLeft >= 0 ? (
                              <span
                                className={
                                  "font-bold " +
                                  (daysLeft < 7
                                    ? "text-red-600"
                                    : daysLeft < 30
                                      ? "text-orange-500"
                                      : "text-green-600")
                                }
                              >
                                {daysLeft} days
                              </span>
                            ) : daysLeft !== null ? (
                              <span className="text-red-600 font-bold">
                                Expired
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
