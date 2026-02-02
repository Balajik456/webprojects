import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/Appcontext";

const Login = () => {
  const { setShowLogin, setToken } = useAppContext();
  const navigate = useNavigate();

  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ MUST BE async
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const url = state === "login" ? "/api/user/login" : "/api/user/register";

      const { data } = await axios.post(
        `http://localhost:3000${url}`,
        {
          name,
          email,
          password,
        }
      );

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setShowLogin(false);
        navigate("/");
        toast.success(data.message || "Success");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmitHandler}
        className="bg-white p-8 rounded-lg w-80"
      >
        <h2 className="text-xl mb-4">
          {state === "login" ? "Login" : "Register"}
        </h2>

        {state === "register" && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full mb-2"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <button className="bg-indigo-500 text-white w-full py-2 rounded">
          {state === "login" ? "Login" : "Create Account"}
        </button>

        <p className="text-sm mt-3">
          {state === "login" ? (
            <>
              No account?{" "}
              <span
                className="text-indigo-500 cursor-pointer"
                onClick={() => setState("register")}
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                className="text-indigo-500 cursor-pointer"
                onClick={() => setState("login")}
              >
                Login
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default Login;
