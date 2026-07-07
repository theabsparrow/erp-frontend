import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/provider/AuthProvider";
import type { Permission } from "@/constants/permissions";

interface ProtectedRouteProps {
  permission?: Permission;
}

export function ProtectedRoute({ permission }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (permission && !user?.permissions?.includes(permission)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
