import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/Appcontext";

const Login = () => {
  const { setShowLogin, setToken, axios } = useAppContext();
  const navigate = useNavigate();

  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const url = state === "login" ? "/api/user/login" : "/api/user/register";

      const { data } = await axios.post(url, {
        name,
        email,
        password,
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setShowLogin(false);
        navigate("/");
        toast.success(data.message || "Success!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmitHandler}
        className="bg-white p-8 rounded-xl w-96 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {state === "login" ? "Login" : "Register"}
          </h2>
          <button
            type="button"
            onClick={() => setShowLogin(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {state === "register" && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white w-full py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading
            ? "Please wait..."
            : state === "login"
              ? "Login"
              : "Create Account"}
        </button>

        <p className="text-sm mt-4 text-center text-gray-600">
          {state === "login" ? (
            <>
              Don't have an account?{" "}
              <span
                className="text-indigo-600 cursor-pointer font-medium hover:underline"
                onClick={() => setState("register")}
              >
                Register here
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="text-indigo-600 cursor-pointer font-medium hover:underline"
                onClick={() => setState("login")}
              >
                Login here
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default Login;
