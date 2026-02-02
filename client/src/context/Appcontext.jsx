import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const Appcontext = createContext();

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // ✅ ONLY ALL CARS (not availability-based)
  const [cars, setCars] = useState([]);

  /* ================= FETCH USER ================= */

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get("/api/user/data");

      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");
      }
    } catch (error) {
      console.warn("User not logged in");
    }
  };

  /* ================= FETCH ALL CARS ================= */

  const fetchCars = async () => {
    try {
      const { data } = await axiosInstance.get("/api/car/cars");

      if (data.success) {
        setCars(data.cars);
      }
    } catch (error) {
      console.error("Fetch cars failed:", error.message);
      toast.error("Failed to load cars");
    }
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);

    delete axiosInstance.defaults.headers.common["Authorization"];
    navigate("/");
  };

  /* ================= LOAD TOKEN ON START ================= */

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${storedToken}`;
      fetchUser();
    }

    // 🔥 ALWAYS LOAD CARS (even without login)
    fetchCars();
  }, []);

  /* ================= TOKEN CHANGE ================= */

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      fetchUser();
    }
  }, [token]);

  /* ================= CONTEXT VALUE ================= */

  const value = {
    navigate,
    currency,
    axios: axiosInstance,

    token,
    setToken,

    user,
    isOwner,

    showLogin,
    setShowLogin,

    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,

    cars,
    fetchCars,

    fetchUser,
    logout,
  };

  return <Appcontext.Provider value={value}>{children}</Appcontext.Provider>;
};

export const useAppContext = () => useContext(Appcontext);
