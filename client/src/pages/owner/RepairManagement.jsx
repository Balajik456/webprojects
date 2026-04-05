import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/Appcontext";
import { MapPin, Phone, Search, X } from "lucide-react";
import toast from "react-hot-toast";

const RepairManagement = () => {
  const { axios, repairs, fetchAllRepairs } = useAppContext();
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [showShopModal, setShowShopModal] = useState(false);

  useEffect(() => {
    fetchAllRepairs();
  }, []);

  // Find nearby shops for a repair request
  const findNearbyShops = async (repairId) => {
    try {
      const { data } = await axios.get(`/api/repair/nearest-shops/${repairId}`);
      if (data.success) {
        setNearbyShops(data.shops);
        setShowShopModal(true);
      } else {
        toast.error(data.message || "No shops found nearby");
      }
    } catch (error) {
      toast.error(
        "Failed to find nearby shops. Make sure location is available.",
      );
    }
  };

  // Assign a shop to a repair request
  const assignShop = async (repairId, shopId) => {
    try {
      const { data } = await axios.post("/api/repair/assign-shop", {
        repairId,
        shopId,
      });

      if (data.success) {
        toast.success("✅ Shop assigned successfully!");

        // Send WhatsApp message to shop
        const repair = data.repair;
        const shop = repair.assignedShop;

        sendWhatsAppToShop(repair, shop);

        setShowShopModal(false);
        fetchAllRepairs();
      }
    } catch (error) {
      toast.error("Failed to assign shop");
    }
  };

  // ✅ FIXED: Send WhatsApp message to mechanic shop
  const sendWhatsAppToShop = (repair, shop) => {
    let message = "";

    if (repair.serviceType === "Self-Drive") {
      message =
        `🚗 *NEW REPAIR REQUEST - SELF DRIVE*%0A%0A` +
        `👤 Customer: ${repair.user?.name}%0A` +
        `📞 Phone: ${repair.user?.phone || repair.user?.email}%0A` +
        `🚙 Car: ${repair.car}%0A` +
        `🔧 Issue: ${repair.issue}%0A` +
        `📅 Date: ${repair.date}%0A%0A` +
        `📍 Customer Location: ${repair.pickupAddress}%0A%0A` +
        `ℹ️ Customer will drive to your shop.%0A` +
        `Please contact them to confirm appointment.`;
    } else {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(repair.pickupAddress)}`;
      message =
        `🏠 *NEW REPAIR REQUEST - DOORSTEP PICKUP*%0A%0A` +
        `👤 Customer: ${repair.user?.name}%0A` +
        `📞 Phone: ${repair.user?.phone || repair.user?.email}%0A` +
        `🚙 Car: ${repair.car}%0A` +
        `🔧 Issue: ${repair.issue}%0A` +
        `📅 Date: ${repair.date}%0A%0A` +
        `📍 Pickup Address: ${repair.pickupAddress}%0A` +
        `🗺️ Navigate: ${mapUrl}%0A%0A` +
        `⚠️ Please pick up the vehicle from customer location.`;
    }

    // ✅ CRITICAL: Format phone number correctly for WhatsApp
    const phoneNumber = shop.phoneNumber.replace(/[^0-9]/g, ""); // Remove any non-numeric characters

    // Open WhatsApp with the message
    window.open(`https://wa.me/${9025829069}?text=${message}`, "_blank");
  };

  // Contact assigned shop via WhatsApp
  const contactShop = (repair) => {
    const shop = repair.assignedShop;
    sendWhatsAppToShop(repair, shop);
  };

  // Open Google Maps
  const openMap = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
  };

  // ✅ NEW: Open shop location on Google Maps
  const openShopLocation = (shop) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">🔧 Repair Management</h1>

      {/* Repairs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repairs.map((r) => (
          <div key={r._id} className="bg-white p-5 rounded-xl border shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{r.car}</h3>
                <p className="text-xs text-gray-500">{r.user?.name}</p>
              </div>
              <span
                className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${
                  r.serviceType === "Self-Drive"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {r.serviceType === "Self-Drive" ? " SELF-DRIVE" : " PICKUP"}
              </span>
            </div>

            {/* Issue */}
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-semibold">Issue:</span> {r.issue}
            </p>

            {/* Date */}
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-semibold">Date:</span> {r.date}
            </p>

            {/* User Location */}
            {r.pickupAddress && (
              <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-800 mb-1">
                  📍 Customer Location:
                </p>
                <p className="text-xs text-gray-700">{r.pickupAddress}</p>
                {r.latitude && r.longitude && (
                  <p className="text-xs text-gray-400 mt-1">
                    {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            )}

            {/* Assigned Shop */}
            {r.assignedShop ? (
              <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-xs font-semibold text-green-800 mb-1">
                  ✅ Assigned Shop:
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {r.assignedShop.shopName}
                </p>
                <p className="text-xs text-gray-600">
                  {r.assignedShop.phoneNumber}
                </p>

                {/* ✅ Show shop location button */}
                <button
                  onClick={() => openShopLocation(r.assignedShop)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  📍 View Shop Location
                </button>
              </div>
            ) : (
              <div className="mb-3 p-2 bg-orange-50 rounded border border-orange-200">
                <p className="text-xs font-semibold text-orange-800">
                  ⚠️ No shop assigned yet
                </p>
              </div>
            )}

            {/* Status */}
            <div className="mb-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  r.status === "Pending"
                    ? "bg-orange-100 text-orange-600"
                    : r.status === "Assigned"
                      ? "bg-blue-100 text-blue-600"
                      : r.status === "In Progress"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-green-100 text-green-600"
                }`}
              >
                {r.status.toUpperCase()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              {/* Assign Shop Button */}
              {!r.assignedShop && r.latitude && r.longitude && (
                <button
                  onClick={() => {
                    setSelectedRepair(r);
                    findNearbyShops(r._id);
                  }}
                  className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-indigo-700"
                >
                  <Search size={14} /> Find Shop
                </button>
              )}

              {/* If no location */}
              {!r.assignedShop && (!r.latitude || !r.longitude) && (
                <div className="flex-1 bg-gray-200 text-gray-500 py-2 px-3 rounded-lg text-xs font-bold text-center">
                  No Location Data
                </div>
              )}

              {/* Map Button */}
              {r.pickupAddress && (
                <button
                  onClick={() => openMap(r.pickupAddress)}
                  className="flex-1 bg-yellow-500 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-yellow-600"
                >
                  <MapPin size={14} /> Map
                </button>
              )}

              {/* Contact Shop Button */}
              {r.assignedShop && (
                <button
                  onClick={() => contactShop(r)}
                  className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-600"
                >
                  <Phone size={14} /> WhatsApp
                </button>
              )}
            </div>
          </div>
        ))}

        {repairs.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            No repair requests yet
          </div>
        )}
      </div>

      {/* Shop Assignment Modal */}
      {showShopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                🏪 Nearby Mechanic Shops ({nearbyShops.length})
              </h2>
              <button
                onClick={() => setShowShopModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {nearbyShops.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-4">
                  No nearby shops found. Please add mechanic shops first.
                </p>
                <button
                  onClick={() => setShowShopModal(false)}
                  className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyShops.map((shop) => (
                  <div
                    key={shop._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{shop.shopName}</h3>
                        <p className="text-sm text-gray-600">
                          {shop.ownerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-indigo-600">
                          {shop.distance?.toFixed(1)} km
                        </span>
                        <p className="text-xs text-gray-500">away</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                      <Phone size={14} /> {shop.phoneNumber}
                    </p>

                    <p className="text-xs text-gray-500 mb-2">
                      <MapPin size={12} className="inline" /> {shop.address}
                    </p>

                    {/* ✅ Show shop location button */}
                    <button
                      onClick={() => openShopLocation(shop)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline mb-3"
                    >
                      📍 View on Google Maps
                    </button>

                    {shop.specialization && shop.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {shop.specialization.map((spec, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => assignShop(selectedRepair._id, shop._id)}
                      className="w-full bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition"
                    >
                      ✅ Assign This Shop
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairManagement;
