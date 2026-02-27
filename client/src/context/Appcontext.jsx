import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export const Appcontext = createContext();

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_BASE_URL || "https://webprojects-server.vercel.app",
  withCredentials: true,
});

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const [cars, setCars] = useState([]);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [currency, setCurrency] = useState(
    import.meta.env.VITE_CURRENCY || "₹",
  );
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setIsOwner(false);
          setIsAdmin(false);
          setShowLogin(true);
          toast.error("Session expired. Please login again.");
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const getCarsData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/car/list");
      if (data.success) {
        setCars(data.cars);
      } else {
        toast.error("Failed to load cars");
      }
    } catch (error) {
      console.error("Failed to fetch car data");
      toast.error("Failed to load cars");
    }
  };

  const fetchRepairs = async () => {
    try {
      const { data } = await axiosInstance.get("/api/repair/my-repairs");
      if (data.success) setRepairs(data.repairs);
    } catch (error) {
      console.error("User repair fetch failed");
    }
  };

  const fetchAllRepairs = async () => {
    try {
      const { data } = await axiosInstance.get("/api/repair/all");
      if (data.success) setRepairs(data.repairs);
    } catch (error) {
      console.error("Admin repair fetch failed");
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get("/api/user/data");
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner" || data.user.role === "admin");
        setIsAdmin(data.user.role === "admin");
      }
    } catch (error) {
      console.warn("Auth check failed");
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setIsOwner(false);
      setIsAdmin(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    setIsAdmin(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    getCarsData();
    if (token) {
      fetchUser();
    }
  }, [token]);

  const value = {
    axios: axiosInstance,
    token,
    setToken,
    user,
    setUser,
    fetchUser,
    isOwner,
    setIsOwner,
    isAdmin,
    navigate,
    repairs,
    fetchRepairs,
    fetchAllRepairs,
    cars,
    getCarsData,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
    currency,
    showLogin,
    setShowLogin,
    logout,
  };

  return <Appcontext.Provider value={value}>{children}</Appcontext.Provider>;
};

export const useAppContext = () => useContext(Appcontext);
