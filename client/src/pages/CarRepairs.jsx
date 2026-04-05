import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Wrench, Store } from "lucide-react";
import { useAppContext } from "../context/Appcontext";
import toast from "react-hot-toast";

const CarRepairs = () => {
  const { axios, user, repairs, fetchRepairs } = useAppContext();
  const [serviceType, setServiceType] = useState("Self-Drive");
  const [formData, setFormData] = useState({
    car: "",
    issue: "",
    date: "",
    pickupAddress: "",
    latitude: null,
    longitude: null,
  });
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    if (user) fetchRepairs();
  }, [user]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("GPS not supported in your browser");
    }

    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // Get address from coordinates
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = await res.json();

          setFormData({
            ...formData,
            pickupAddress: data.display_name,
            latitude,
            longitude,
          });

          toast.success("📍 Location detected successfully!");
        } catch (err) {
          toast.error("Failed to get address from location");
        } finally {
          setLoadingLoc(false);
        }
      },
      (error) => {
        setLoadingLoc(false);
        toast.error("Please enable location access in your browser");
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ CRITICAL: Always require location for both service types
    if (!formData.latitude || !formData.longitude) {
      toast.error("⚠️ Please detect your location first!");
      return;
    }

    if (!formData.pickupAddress) {
      toast.error("Please provide your address");
      return;
    }

    try {
      const payload = {
        car: formData.car,
        issue: formData.issue,
        date: formData.date,
        serviceType,
        pickupAddress: formData.pickupAddress,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      console.log("Submitting repair:", payload); // Debug log

      const { data } = await axios.post("/api/repair/add", payload);

      if (data.success) {
        toast.success("✅ " + data.message);
        fetchRepairs();
        setFormData({
          car: "",
          issue: "",
          date: "",
          pickupAddress: "",
          latitude: null,
          longitude: null,
        });
        setServiceType("Self-Drive");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit request");
    }
  };

  return (
    <div className="p-6 md:px-20 bg-gray-50 min-h-screen">
      {/* Request Form */}
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto mb-12 border border-gray-100">
        <h2 className="text-xl font-bold text-indigo-600 mb-6 flex gap-2">
          <Navigation /> Request Car Repair
        </h2>

        {/* Service Type Toggle */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setServiceType("Self-Drive")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              serviceType === "Self-Drive"
                ? "bg-white shadow text-indigo-600"
                : "text-gray-500"
            }`}
          >
            🚗 I will Drive to Shop
          </button>
          <button
            type="button"
            onClick={() => setServiceType("Doorstep")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              serviceType === "Doorstep"
                ? "bg-white shadow text-indigo-600"
                : "text-gray-500"
            }`}
          >
            🏠 Pickup My Car
          </button>
        </div>

        {/* Info Box explaining service types */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            {serviceType === "Self-Drive" ? (
              <>
                <strong>Self-Drive:</strong> You will drive your car to the
                mechanic shop we assign to you.
              </>
            ) : (
              <>
                <strong>Pickup Service:</strong> The mechanic will come to your
                location to pick up your car.
              </>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={formData.car}
            onChange={(e) => setFormData({ ...formData, car: e.target.value })}
            placeholder="Car Model (e.g., Honda Civic)"
            className="w-full border p-3 rounded-lg outline-none focus:border-indigo-500"
            required
          />

          <input
            value={formData.issue}
            onChange={(e) =>
              setFormData({ ...formData, issue: e.target.value })
            }
            placeholder="Problem Description"
            className="w-full border p-3 rounded-lg outline-none focus:border-indigo-500"
            required
          />

          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            className="w-full border p-3 rounded-lg focus:border-indigo-500"
            required
          />

          {/* ✅ ALWAYS SHOW LOCATION FIELD - Required for both service types */}
          <div className="relative">
            <input
              value={formData.pickupAddress}
              onChange={(e) =>
                setFormData({ ...formData, pickupAddress: e.target.value })
              }
              placeholder={
                serviceType === "Self-Drive"
                  ? "Your Current Location"
                  : "Car Pickup Address"
              }
              className="w-full border p-3 rounded-lg pr-12 outline-none focus:border-indigo-500"
              required
            />
            <button
              type="button"
              onClick={detectLocation}
              disabled={loadingLoc}
              className="absolute right-3 top-3.5 text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
              title="Detect my location"
            >
              {loadingLoc ? (
                <div className="animate-spin">⏳</div>
              ) : (
                <MapPin size={20} className="animate-pulse" />
              )}
            </button>
          </div>

          {/* Location Status Indicator */}
          {formData.latitude && formData.longitude ? (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
              <span>✓</span>
              <span>
                Location saved: {formData.latitude.toFixed(4)},{" "}
                {formData.longitude.toFixed(4)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
              <span>⚠️</span>
              <span>Please click the 📍 icon to detect your location</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!formData.latitude || !formData.longitude}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Repair Request
          </button>
        </form>
      </div>

      {/* User's Repair History */}
      <div className="max-w-6xl mx-auto">
        <h3 className="text-xl font-bold mb-4">My Repair Requests</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repairs.map((r) => (
            <div
              key={r._id}
              className="bg-white p-5 rounded-xl border shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-lg font-bold">{r.car}</span>
                <span
                  className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${
                    r.serviceType === "Self-Drive"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {r.serviceType === "Self-Drive"
                    ? "🚗 SELF-DRIVE"
                    : "🏠 PICKUP"}
                </span>
              </div>

              <p className="text-sm text-gray-500 flex gap-2 mb-2">
                <Wrench size={14} /> {r.issue}
              </p>

              <p className="text-xs text-gray-400 mb-3">📅 {r.date}</p>

              {/* Show pickup address */}
              {r.pickupAddress && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  📍 {r.pickupAddress}
                </div>
              )}

              {/* Assigned Shop */}
              {r.assignedShop ? (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
                    <Store size={12} />
                    Assigned Shop:
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {r.assignedShop.shopName}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    📞 {r.assignedShop.phoneNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {r.assignedShop.address}
                  </p>
                </div>
              ) : (
                <div className="mt-3 p-2 bg-orange-50 rounded border border-orange-200">
                  <p className="text-xs font-semibold text-orange-800">
                    ⏳ Waiting for shop assignment...
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="mt-4 pt-4 border-t flex justify-between text-xs">
                <span
                  className={`font-bold ${
                    r.status === "Pending"
                      ? "text-orange-600"
                      : r.status === "Assigned"
                        ? "text-blue-600"
                        : r.status === "Completed"
                          ? "text-green-600"
                          : "text-indigo-600"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}

          {repairs.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400">
              No repair requests yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarRepairs;
