import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
  allow,
  children,
}: {
  allow: Array<"admin" | "researcher">;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  if (!allow.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
