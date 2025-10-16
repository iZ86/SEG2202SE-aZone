import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GuestLogin from "@routes/GuestLogin";
import Dashboard from "@routes/Dashboard";

const routes = [
  {
    path: "/login",
    element: <GuestLogin />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  }
];

export const Router = () => {
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};
