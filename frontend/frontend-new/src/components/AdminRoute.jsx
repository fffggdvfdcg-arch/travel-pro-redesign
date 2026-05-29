import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isStaff = ["manager", "admin", "superadmin"].includes(user?.role);
  if (!token || !isStaff) return <Navigate to="/login" replace />;
  return children;
}
