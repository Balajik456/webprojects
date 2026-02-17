import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/Appcontext";
import { MapPin, Phone, Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const ManageShops = () => {
  const { axios } = useAppContext();
  const [shops, setShops] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    phoneNumber: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    specialization: "",
  });
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const { data } = await axios.get("/api/mechanic-shop/all");
      if (data.success) {
        setShops(data.shops);
      }
    } catch (error) {
      toast.error("Failed to load shops");
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("GPS not supported");
    }

    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const data = await res.json();

        setFormData({
          ...formData,
          address: data.display_name,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });

        toast.success("📍 Location detected!");
      } catch (err) {
        toast.error("Location lookup failed");
      } finally {
        setLoadingLoc(false);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        specialization: formData.specialization.split(",").map((s) => s.trim()),
      };

      const { data } = await axios.post("/api/mechanic-shop/add", payload);

      if (data.success) {
        toast.success("✅ Shop added successfully!");
        fetchShops();
        setShowForm(false);
        setFormData({
          shopName: "",
          ownerName: "",
          phoneNumber: "",
          address: "",
          city: "",
          latitude: "",
          longitude: "",
          specialization: "",
        });
      }
    } catch (error) {
      toast.error("Failed to add shop");
    }
  };

  const deleteShop = async (shopId) => {
    if (!window.confirm("Are you sure you want to delete this shop?")) return;

    try {
      const { data } = await axios.delete("/api/mechanic-shop/delete", {
        data: { shopId },
      });

      if (data.success) {
        toast.success("Shop deleted!");
        fetchShops();
      }
    } catch (error) {
      toast.error("Failed to delete shop");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🏪 Manage Mechanic Shops</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Shop
        </button>
      </div>

      {/* Add Shop Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-bold mb-4">Add New Mechanic Shop</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                value={formData.shopName}
                onChange={(e) =>
                  setFormData({ ...formData, shopName: e.target.value })
                }
                placeholder="Shop Name"
                className="border p-3 rounded-lg outline-none"
                required
              />
              <input
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                placeholder="Owner Name"
                className="border p-3 rounded-lg outline-none"
                required
              />
              <input
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="Phone Number"
                className="border p-3 rounded-lg outline-none"
                required
              />
              <input
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="City"
                className="border p-3 rounded-lg outline-none"
                required
              />
            </div>

            <div className="relative">
              <input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Full Address"
                className="w-full border p-3 rounded-lg pr-12 outline-none"
                required
              />
              <button
                type="button"
                onClick={detectLocation}
                className="absolute right-3 top-3.5 text-indigo-500"
              >
                <MapPin
                  className={loadingLoc ? "animate-bounce" : ""}
                  size={20}
                />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                placeholder="Latitude"
                type="number"
                step="any"
                className="border p-3 rounded-lg outline-none"
                required
              />
              <input
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                placeholder="Longitude"
                type="number"
                step="any"
                className="border p-3 rounded-lg outline-none"
                required
              />
            </div>

            <input
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              placeholder="Specialization (e.g., Engine, Brake, Electrical)"
              className="w-full border p-3 rounded-lg outline-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700"
              >
                Add Shop
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shops List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.map((shop) => (
          <div
            key={shop._id}
            className="bg-white p-5 rounded-xl border shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">{shop.shopName}</h3>
              <button
                onClick={() => deleteShop(shop._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Owner:</span> {shop.ownerName}
            </p>

            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <Phone size={14} />
              {shop.phoneNumber}
            </p>

            <p className="text-sm text-gray-600 mb-2 flex items-start gap-1">
              <MapPin size={14} className="mt-1" />
              <span className="text-xs">{shop.address}</span>
            </p>

            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-400">
                📍 {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}
              </p>
            </div>

            {shop.specialization && shop.specialization.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
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
          </div>
        ))}

        {shops.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            No mechanic shops added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageShops;
