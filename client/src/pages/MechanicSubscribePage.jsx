import React, { useState } from "react";
import { Check, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://webprojects-server.vercel.app";

const MechanicSubscribePage = () => {
  const [loading, setLoading] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phoneNumber: "",
    email: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    specialization: "",
  });

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("GPS not supported");
      return;
    }
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const json = await res.json();
          setForm((prev) => ({
            ...prev,
            address: json.display_name,
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));
          toast.success("Location detected!");
        } catch {
          toast.error("Location lookup failed");
        } finally {
          setLoadingLoc(false);
        }
      },
      () => {
        setLoadingLoc(false);
        toast.error("Please enable location access");
      },
    );
  };

  const validate = () => {
    if (!form.shopName.trim()) {
      toast.error("Shop name required");
      return false;
    }
    if (!form.ownerName.trim()) {
      toast.error("Owner name required");
      return false;
    }
    if (!/^[0-9]{10,15}$/.test(form.phoneNumber.replace(/\s/g, ""))) {
      toast.error("Enter valid phone number (10-15 digits)");
      return false;
    }
    if (!form.email.includes("@") || !form.email.includes(".")) {
      toast.error("Enter valid email");
      return false;
    }
    if (!form.city.trim()) {
      toast.error("City required");
      return false;
    }
    if (!form.address.trim()) {
      toast.error("Address required");
      return false;
    }
    if (!form.latitude || !form.longitude) {
      toast.error("Please detect GPS location");
      return false;
    }
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return false;
    }
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        shopName: form.shopName,
        ownerName: form.ownerName,
        phoneNumber: form.phoneNumber.replace(/\D/g, ""),
        email: form.email,
        city: form.city,
        address: form.address,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        specialization: form.specialization
          ? form.specialization.split(",").map((s) => s.trim())
          : ["General Repair"],
        plan: selectedPlan,
        transactionId: transactionId,
        amount: selectedPlan === "monthly" ? 100 : 1000,
      };
      const { data } = await axios.post(
        BASE_URL + "/api/subscription/self-register",
        payload,
      );
      if (data.success) {
        localStorage.setItem("mechanicEmail", form.email);
        setSubmitted(true);
        toast.success("Subscription request submitted!");
      } else {
        toast.error(data.message || "Submission failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Request Submitted!
          </h2>
          <p className="text-gray-500 mb-6">
            Admin will verify and activate your subscription within 24 hours.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2 mb-6">
            <p>
              <span className="font-semibold">Shop:</span> {form.shopName}
            </p>
            <p>
              <span className="font-semibold">Owner:</span> {form.ownerName}
            </p>
            <p>
              <span className="font-semibold">Plan:</span>{" "}
              {selectedPlan === "monthly"
                ? "Monthly - Rs.100"
                : "Annual - Rs.1000"}
            </p>
            <p>
              <span className="font-semibold">Transaction ID:</span>{" "}
              {transactionId}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span className="text-yellow-600 font-bold">
                Pending Approval
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/mechanic/status"
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
            >
              Check Status
            </a>
            <a
              href="/"
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Mechanic Subscription
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Fill in your shop details and choose a plan to get listed.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name *
            </label>
            <input
              type="text"
              value={form.shopName}
              onChange={update("shopName")}
              placeholder="e.g. Kumar Auto Works"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name *
            </label>
            <input
              type="text"
              value={form.ownerName}
              onChange={update("ownerName")}
              placeholder="e.g. Ramesh Kumar"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={update("phoneNumber")}
              placeholder="e.g. 9876543210"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="e.g. shop@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              value={form.city}
              onChange={update("city")}
              placeholder="e.g. Chennai"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.address}
                onChange={update("address")}
                placeholder="Shop address"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={detectLocation}
                disabled={loadingLoc}
                className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition disabled:opacity-50"
              >
                <MapPin size={16} />
                {loadingLoc ? "Detecting..." : "GPS"}
              </button>
            </div>
            {form.latitude && form.longitude && (
              <p className="text-xs text-green-600 mt-1">
                📍 {parseFloat(form.latitude).toFixed(5)},{" "}
                {parseFloat(form.longitude).toFixed(5)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization (comma-separated)
            </label>
            <input
              type="text"
              value={form.specialization}
              onChange={update("specialization")}
              placeholder="e.g. Bike Repair, Tyre Change, Oil Service"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Plan *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "monthly", label: "Monthly", price: "Rs. 100" },
                { key: "annual", label: "Annual", price: "Rs. 1000" },
              ].map((plan) => (
                <button
                  key={plan.key}
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`border-2 rounded-xl p-4 text-left transition ${selectedPlan === plan.key ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"}`}
                >
                  <p className="font-semibold text-gray-800">{plan.label}</p>
                  <p className="text-indigo-600 font-bold">{plan.price}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPI / Transaction ID *
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter your payment transaction ID"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Subscription Request"}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Already a member?{" "}
          <a
            href="/mechanic/status"
            className="text-indigo-500 hover:underline"
          >
            Check Status
          </a>
        </p>
      </div>
    </div>
  );
};

export default MechanicSubscribePage;
