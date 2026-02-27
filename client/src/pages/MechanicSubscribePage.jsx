import React, { useState } from "react";
import { Check, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://webprojects-server.vercel.app";

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
            "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
              lat +
              "&lon=" +
              lng,
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
        setSubmitted(true);
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
          <a
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Register Your Mechanic Shop
          </h1>
          <p className="text-gray-500 mt-2">
            Fill your details, choose a plan and submit payment to get listed.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">
              Step 1 - Shop Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Shop Name
                  </label>
                  <input
                    value={form.shopName}
                    onChange={update("shopName")}
                    placeholder="e.g. Arun Mechanic Shop"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Owner Name
                  </label>
                  <input
                    value={form.ownerName}
                    onChange={update("ownerName")}
                    placeholder="e.g. Arun Kumar"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    value={form.phoneNumber}
                    onChange={update("phoneNumber")}
                    placeholder="e.g. 9876543210"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="e.g. arun@gmail.com"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  City
                </label>
                <input
                  value={form.city}
                  onChange={update("city")}
                  placeholder="e.g. Chennai"
                  className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Full Address (click pin icon to auto-detect)
                </label>
                <div className="relative">
                  <input
                    value={form.address}
                    onChange={update("address")}
                    placeholder="Click the pin icon or type manually"
                    className="w-full border border-gray-300 p-3 pr-12 rounded-lg outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="absolute right-3 top-3 text-indigo-500 hover:text-indigo-700"
                  >
                    <MapPin
                      size={22}
                      className={loadingLoc ? "animate-bounce" : ""}
                    />
                  </button>
                </div>
              </div>
              {form.latitude && form.longitude && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-2 rounded-lg">
                  Location saved: {parseFloat(form.latitude).toFixed(4)},{" "}
                  {parseFloat(form.longitude).toFixed(4)}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Latitude
                  </label>
                  <input
                    value={form.latitude}
                    onChange={update("latitude")}
                    placeholder="Auto-filled by GPS"
                    type="number"
                    step="any"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Longitude
                  </label>
                  <input
                    value={form.longitude}
                    onChange={update("longitude")}
                    placeholder="Auto-filled by GPS"
                    type="number"
                    step="any"
                    className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Specialization (optional)
                </label>
                <input
                  value={form.specialization}
                  onChange={update("specialization")}
                  placeholder="e.g. Engine, Brake, Electrical"
                  className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">
              Step 2 - Choose Your Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedPlan("monthly")}
                className={
                  "cursor-pointer rounded-xl border-2 p-5 transition-all " +
                  (selectedPlan === "monthly"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300")
                }
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-800">Monthly Plan</h3>
                  {selectedPlan === "monthly" && (
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-3xl font-bold text-indigo-600 mb-1">
                  Rs.100
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  per month / 30 days
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-green-500" />
                    Appear in search results
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-green-500" />
                    Receive repair requests
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-green-500" />
                    WhatsApp notifications
                  </li>
                </ul>
              </div>
              <div
                onClick={() => setSelectedPlan("annual")}
                className={
                  "cursor-pointer rounded-xl border-2 p-5 transition-all relative " +
                  (selectedPlan === "annual"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300")
                }
              >
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Save Rs.200
                </span>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-800">Annual Plan</h3>
                  {selectedPlan === "annual" && (
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-3xl font-bold text-indigo-600 mb-1">
                  Rs.1000
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  per year / 365 days
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-green-500" />
                    All monthly features
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-green-500" />
                    Priority listing
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={13} className="text-green-500" />
                    24/7 support
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {selectedPlan && (
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">
                Step 3 - Payment
              </h2>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4 text-sm">
                <p className="font-semibold text-indigo-700 mb-1">
                  Order Summary
                </p>
                <p className="text-gray-700">
                  Plan:{" "}
                  <strong>
                    {selectedPlan === "monthly"
                      ? "Monthly - Rs.100"
                      : "Annual - Rs.1000"}
                  </strong>
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-blue-800 mb-3">
                  Pay via UPI or Bank Transfer
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">UPI ID:</span>
                    <code className="bg-white px-3 py-1 rounded border font-mono text-indigo-700">
                      admin@upi
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account No:</span>
                    <code className="bg-white px-3 py-1 rounded border font-mono text-indigo-700">
                      1234567890
                    </code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">IFSC:</span>
                    <code className="bg-white px-3 py-1 rounded border font-mono text-indigo-700">
                      SBIN0001234
                    </code>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-3 bg-blue-100 rounded p-2">
                  Use your Shop Name as the payment note
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Transaction ID / UPI Reference
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID after payment"
                  className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Submitting..." : "Submit Subscription Request"}
          </button>
          <p className="text-center text-xs text-gray-400">
            Already a member?{" "}
            <a href="/" className="text-indigo-500 hover:underline">
              Go to Home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MechanicSubscribePage;
