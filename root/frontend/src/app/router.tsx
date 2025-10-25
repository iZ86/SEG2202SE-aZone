import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GuestLogin from "@routes/GuestLogin";
import Dashboard from "@routes/Dashboard";
import Enrollment from "@routes/Enrollment"
import AdminDashboard from "@routes/admin/AdminDashboard";
import AdminLogin from "@routes/admin/AdminLogin";
import AdminUser from "@routes/admin/AdminUser";

const routes = [
  {
    path: "/login",
    element: <GuestLogin />,
  },
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/enrollment",
    element: <Enrollment />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/users",
    element: <AdminUser />,
  },
];

export const Router = () => {
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};
