import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GuestLogin from "@routes/GuestLogin";
import Dashboard from "@routes/Dashboard";
import AdminDashboard from "@routes/admin/AdminDashboard";
import AdminLogin from "@routes/admin/AdminLogin";

const routes = [
  {
    path: "/login",
    element: <GuestLogin />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />
  },
  {
    path: "/admin/dashboard",
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
