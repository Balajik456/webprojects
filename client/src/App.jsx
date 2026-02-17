import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Cardetails from "./pages/Cardetails";
import MyBooking from "./pages/MyBooking";
import CarRepairs from "./pages/CarRepairs";
import Layout from "./pages/owner/Layout";
import Dashboard from "./pages/owner/Dashboard";
import Addcars from "./pages/owner/Addcars";
import Managecars from "./pages/owner/Managecars";
import ManageBooking from "./pages/owner/ManageBooking";
import RepairDashboard from "./pages/owner/RepairDashboard";
import RepairManagement from "./pages/owner/RepairManagement";
import ManageShops from "./pages/owner/ManageShops";
import Finance from "./pages/owner/Finance";
import Login from "./components/Login"; // Make sure this path is correct
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/Appcontext";

const App = () => {
  const { showLogin, token, isOwner } = useAppContext();
  const location = useLocation();
  const isOwnerPath = location.pathname.startsWith("/owner");

  return (
    <>
      <Toaster position="top-center" />

      {/* Login Modal */}
      {showLogin && <Login />}

      {/* Navbar - Hidden on owner pages */}
      {!isOwnerPath && <Navbar />}

      <Routes>
        {/* USER ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car-details/:id" element={<Cardetails />} />
        <Route path="/my-bookings" element={<MyBooking />} />
        <Route path="/car-repairs" element={<CarRepairs />} />

        {/* OWNER ROUTES (Protected) */}
        <Route
          path="/owner"
          element={token && isOwner ? <Layout /> : <Navigate to="/" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="add-car" element={<Addcars />} />
          <Route path="manage-cars" element={<Managecars />} />
          <Route path="manage-bookings" element={<ManageBooking />} />
          <Route path="finance" element={<Finance />} />
          <Route path="manage-shops" element={<ManageShops />} />
          <Route path="repairs" element={<RepairManagement />} />
          <Route path="repair-analytics" element={<RepairDashboard />} />
        </Route>

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Footer - Hidden on owner pages */}
      {!isOwnerPath && <Footer />}
    </>
  );
};

export default App;
