import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GuestLogin from "@routes/GuestLogin";
import Dashboard from "@routes/Dashboard";
import Enrollment from "@routes/Enrollment";
import AdminDashboard from "@routes/admin/AdminDashboard";
import AdminLogin from "@routes/admin/AdminLogin";
import AdminUser from "@routes/admin/AdminUser";
import AdminCreateUser from "@routes/admin/AdminCreateUser";
import AdminEditUser from "@routes/admin/AdminEditUser";
import AdminProgramme from "@routes/admin/AdminProgramme";
import AdminEditProgramme from "@routes/admin/AdminEditProgramme";
import AdminCreateProgramme from "@routes/admin/AdminCreateProgramme";

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
  {
    path: "/admin/users/create",
    element: <AdminCreateUser />,
  },
  {
    path: "/admin/users/:id/edit",
    element: <AdminEditUser />,
  },
  {
    path: "/admin/programmes",
    element: <AdminProgramme />,
  },
  {
    path: "/admin/programmes/create",
    element: <AdminCreateProgramme />,
  },
  {
    path: "/admin/programmes/:id/edit",
    element: <AdminEditProgramme />,
  },
];

export const Router = () => {
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};
