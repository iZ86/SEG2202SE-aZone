import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GuestLogin from "@routes/GuestLogin";
import Dashboard from "@routes/Dashboard";
import AdminDashboard from "@routes/admin/AdminDashboard";

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
    path: "/admin",
    element: <AdminDashboard />,
  },
];

export const Router = () => {
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};
