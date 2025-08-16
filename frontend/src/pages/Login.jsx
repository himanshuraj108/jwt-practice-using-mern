import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/check-auth", {
          withCredentials: true,
        });
        if (res.data.success) {
          navigate("/dashboard");
        }
      } catch (err) {
        // No redirect if not authenticated
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/login", formData, {
        withCredentials: true,
      });
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form className="flex flex-col gap-4 w-80" onSubmit={handleSubmit}>
        <input
          type="email"
          value={formData.email}
          placeholder="Email"
          required
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="password"
          value={formData.password}
          placeholder="Password"
          required
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-400 text-white rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;