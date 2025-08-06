import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/api";

const PasswordResetConfirmPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const onSubmit = async (data) => {
    setMessage("");
    setError("");
    setLoading(true); // Start loading

    if (data.new_password1 !== data.new_password2) {
      setError("Passwords do not match");
      setLoading(false); // Stop loading
      return;
    }
    try {
      const response = await apiClient.post(
        `/auth/password-reset/confirm/${uid}/${token}`,
        {
          new_password1: data.new_password1,
          new_password2: data.new_password2,
        }
      );
      setMessage(response.data.message + " Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      // We want loading to stop, but not immediately if redirecting
      // In this case, it's ok for the button to remain "disabled"
      // But for correctness, let's stop it.
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white font-sans">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-slate-100">
          Set New Password
        </h2>
        {message && (
          <p className="text-green-400 text-center mb-4">{message}</p>
        )}
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label className="block text-slate-400 mb-2">New Password</label>
            <input
              type="password"
              {...register("new_password1", {
                required: "Password is required",
              })}
              className="w-full px-4 py-2 bg-slate-700/50 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.new_password1 && (
              <p className="text-red-400 text-sm mt-1">
                {errors.new_password1.message}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-slate-400 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register("new_password2", {
                required: "Please confirm password",
              })}
              className="w-full px-4 py-2 bg-slate-700/50 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {errors.new_password2 && (
              <p className="text-red-400 text-sm mt-1">
                {errors.new_password2.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold transform hover:scale-105 disabled:opacity-70 disabled:scale-100"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetConfirmPage;
