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

  const onSubmit = async (data) => {
    if (data.new_password1 !== data.new_password2) {
      setError("Passwords do not match");
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
      setMessage(response.data.message);
      setError("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
      setMessage("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Set New Password
        </h2>
        {message && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              {...register("new_password1", {
                required: "Password is required",
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {errors.new_password1 && (
              <p className="text-red-500 text-sm mt-1">
                {errors.new_password1.message}
              </p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700">Confirm New Password</label>
            <input
              type="password"
              {...register("new_password2", {
                required: "Please confirm password",
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {errors.new_password2 && (
              <p className="text-red-500 text-sm mt-1">
                {errors.new_password2.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetConfirmPage;
