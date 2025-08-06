import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth(); // Get the loading state

  // 1. If we are still loading, show a loading message
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white font-sans">
        <div>Loading...</div>
      </div>
    );
  }

  // 2. After loading, if user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If loading is finished and user is authenticated, show the page
  return <Outlet />;
};

export default ProtectedRoute;
