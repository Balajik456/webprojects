import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Home } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://webprojects-server.vercel.app";

const MySubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const mechanicEmail = localStorage.getItem("mechanicEmail");
      if (!mechanicEmail) {
        setLoading(false);
        return;
      }
      const { data } = await axios.get(
        BASE_URL + "/api/mechanic-shop/check-status",
        { params: { email: mechanicEmail } },
      );
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription status...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Subscription Found
          </h2>
          <p className="text-gray-600 mb-6">
            You have not submitted a subscription request yet.
          </p>
          <a
            href="/mechanic/subscribe"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Subscribe Now
          </a>
        </div>
      </div>
    );
  }

  const isPending = subscription.subscriptionStatus === "pending";
  const isApproved =
    subscription.subscriptionStatus === "approved" ||
    subscription.subscriptionStatus === "active";
  const isRejected =
    subscription.subscriptionStatus === "rejected" ||
    subscription.subscriptionStatus === "expired";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            My Subscription Status
          </h1>
          <p className="text-gray-600">
            Check your subscription approval status below
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div
            className={`p-6 ${isApproved ? "bg-green-50 border-l-4 border-green-500" : isPending ? "bg-yellow-50 border-l-4 border-yellow-500" : "bg-red-50 border-l-4 border-red-500"}`}
          >
            <div className="flex items-center gap-4">
              <div>
                {isApproved && (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                )}
                {isPending && (
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock size={32} className="text-yellow-600" />
                  </div>
                )}
                {isRejected && (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle size={32} className="text-red-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {isApproved && "Subscription Approved!"}
                  {isPending && "Pending Approval"}
                  {isRejected && "Subscription Rejected"}
                </h2>
                <p className="text-sm text-gray-600">
                  {isApproved &&
                    "Your subscription is active and you can receive repair requests."}
                  {isPending &&
                    "Admin will verify and activate within 24 hours."}
                  {isRejected &&
                    "Please contact support or resubmit with correct details."}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Shop Name</p>
                <p className="font-semibold text-gray-800">
                  {subscription.shopName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="font-semibold text-gray-800">
                  {subscription.ownerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-semibold text-gray-800">
                  {subscription.subscriptionPlan === "monthly"
                    ? "Monthly"
                    : "Annual"}{" "}
                  - Rs.{subscription.subscriptionAmount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-800">
                  {subscription.phoneNumber}
                </p>
              </div>
            </div>
            {subscription.address && (
              <div>
                <p className="text-sm text-gray-500">Shop Location</p>
                <p className="text-gray-800">{subscription.address}</p>
              </div>
            )}
            {isApproved && subscription.subscriptionEndDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Valid Until:</span>{" "}
                  {new Date(
                    subscription.subscriptionEndDate,
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {isPending && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Your payment is being verified. You will be notified once
                  approved.
                </p>
              </div>
            )}
            {isRejected && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 mb-3">
                  Your subscription request was rejected. Please check your
                  payment details and try again.
                </p>
                <a
                  href="/mechanic/subscribe"
                  className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                >
                  Resubscribe
                </a>
              </div>
            )}
          </div>
          <div className="p-6 bg-gray-50 border-t flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Refresh Status
            </button>
            <a
              href="/"
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition text-center flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Home
            </a>
          </div>
        </div>
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> This page auto-refreshes every 30 seconds. You
            will see updates automatically when admin approves your
            subscription.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MySubscriptionStatus;
