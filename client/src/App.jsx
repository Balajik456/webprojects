import React from "react";
import { Routes, Route, useLocation } from "react-router-dom"; // ✅ useLocation imported

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
import Login from "./components/Login";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/Appcontext";

const App = () => {
  const { showLogin } = useAppContext();

  // ✅ FIX 1: Initialize the location hook
  const location = useLocation();
  const isOwnerPath = location.pathname.startsWith("/owner");

  return (
    <>
      <Toaster />
      {showLogin && <Login />}

      {!isOwnerPath && <Navbar />}

      <Routes>
        {/* ✅ FIX 2: Add the specific route for "/cars" */}
        <Route path="/cars" element={<Cars />} />

        {/* Optional: Keep Home as the default root path if you prefer */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route path="/car-details/:id" element={<Cardetails />} />
        <Route path="/my-bookings" element={<MyBooking />} />
        <Route path="/car-repairs" element={<CarRepairs />} />

        {/* OWNER ROUTES */}
        <Route path="/owner" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-car" element={<Addcars />} />
          <Route path="manage-cars" element={<Managecars />} />
          <Route path="manage-bookings" element={<ManageBooking />} />
        </Route>
      </Routes>

      {!isOwnerPath && <Footer />}
    </>
  );
};

export default App;
