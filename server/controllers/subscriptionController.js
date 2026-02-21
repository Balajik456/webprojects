import MechanicShop from "../models/MechanicShop.js";

// POST /api/subscription/self-register
export const selfRegisterAndSubscribe = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      phoneNumber,
      email,
      city,
      address,
      latitude,
      longitude,
      specialization,
      plan,
      transactionId,
      amount,
    } = req.body;

    if (
      !shopName ||
      !ownerName ||
      !phoneNumber ||
      !email ||
      !city ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All shop details are required" });
    }
    if (!plan || !transactionId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Plan and transaction ID are required",
        });
    }
    if (!["monthly", "annual"].includes(plan)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid plan selected" });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");

    const existing = await MechanicShop.findOne({
      $or: [{ email }, { phoneNumber: cleanPhone }],
      isActive: true,
    });

    if (existing) {
      if (existing.subscriptionStatus === "pending") {
        return res.status(400).json({
          success: false,
          message:
            "You already have a pending request. Please wait for admin approval.",
        });
      }
      if (existing.subscriptionStatus === "active") {
        return res.status(400).json({
          success: false,
          message: "Your subscription is already active.",
        });
      }

      // Expired - allow renewal
      existing.subscriptionStatus = "pending";
      existing.subscriptionPlan = plan;
      existing.subscriptionAmount = amount || (plan === "monthly" ? 100 : 1000);
      existing.paymentHistory.push({
        amount: amount || (plan === "monthly" ? 100 : 1000),
        plan,
        transactionId,
        status: "pending",
        date: new Date(),
      });
      await existing.save();

      return res.json({
        success: true,
        message:
          "Renewal request submitted! Admin will verify and activate soon.",
      });
    }

    const shop = await MechanicShop.create({
      shopName,
      ownerName,
      phoneNumber: cleanPhone,
      email,
      city,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      specialization:
        Array.isArray(specialization) && specialization.length
          ? specialization
          : ["General Repair"],
      subscriptionPlan: plan,
      subscriptionAmount: amount || (plan === "monthly" ? 100 : 1000),
      subscriptionStatus: "pending",
      paymentHistory: [
        {
          amount: amount || (plan === "monthly" ? 100 : 1000),
          plan,
          transactionId,
          status: "pending",
          date: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message:
        "Request submitted! Admin will verify and activate your subscription.",
      shopId: shop._id,
    });
  } catch (error) {
    console.error("selfRegisterAndSubscribe error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/subscription/pending
export const getPendingSubscriptions = async (req, res) => {
  try {
    const shops = await MechanicShop.find({
      subscriptionStatus: "pending",
      isActive: true,
    }).sort({ updatedAt: -1 });

    console.log("Pending shops found:", shops.length);
    res.json({ success: true, shops });
  } catch (error) {
    console.error("getPendingSubscriptions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/subscription/all
export const getAllSubscriptions = async (req, res) => {
  try {
    const shops = await MechanicShop.find({ isActive: true }).sort({
      updatedAt: -1,
    });
    console.log("All shops found:", shops.length);
    res.json({ success: true, shops });
  } catch (error) {
    console.error("getAllSubscriptions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/subscription/approve
export const approveSubscription = async (req, res) => {
  try {
    const { shopId, plan } = req.body;

    if (!shopId || !plan) {
      return res
        .status(400)
        .json({ success: false, message: "shopId and plan required" });
    }

    const shop = await MechanicShop.findById(shopId);
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    const now = new Date();
    const days = plan === "monthly" ? 30 : 365;
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);

    for (let i = shop.paymentHistory.length - 1; i >= 0; i--) {
      if (shop.paymentHistory[i].status === "pending") {
        shop.paymentHistory[i].status = "approved";
        break;
      }
    }

    shop.subscriptionPlan = plan;
    shop.subscriptionStatus = "active";
    shop.subscriptionStartDate = now;
    shop.subscriptionEndDate = endDate;
    shop.subscriptionAmount = plan === "monthly" ? 100 : 1000;

    await shop.save();

    res.json({
      success: true,
      message:
        "Subscription approved! Active until " + endDate.toLocaleDateString(),
      shop,
    });
  } catch (error) {
    console.error("approveSubscription error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/subscription/reject
export const rejectSubscription = async (req, res) => {
  try {
    const { shopId } = req.body;

    const shop = await MechanicShop.findById(shopId);
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    for (let i = shop.paymentHistory.length - 1; i >= 0; i--) {
      if (shop.paymentHistory[i].status === "pending") {
        shop.paymentHistory[i].status = "rejected";
        break;
      }
    }

    shop.subscriptionStatus = "expired";
    await shop.save();

    res.json({ success: true, message: "Subscription request rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/subscription/details/:shopId
export const getSubscriptionDetails = async (req, res) => {
  try {
    const shop = await MechanicShop.findById(req.params.shopId);
    if (!shop) {
      return res.json({
        success: true,
        subscription: { status: "none", paymentHistory: [] },
      });
    }
    res.json({
      success: true,
      subscription: {
        status: shop.subscriptionStatus || "none",
        plan: shop.subscriptionPlan,
        endDate: shop.subscriptionEndDate,
        paymentHistory: shop.paymentHistory,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
