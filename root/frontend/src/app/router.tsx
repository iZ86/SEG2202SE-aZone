import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GuestLogin from "@routes/GuestLogin";
import Dashboard from "@routes/Dashboard";
import Enrollment from "@routes/Enrollment";
import ProgrammeHistory from "@routes/ProgrammeHistory";
import AdminDashboard from "@routes/admin/AdminDashboard";
import AdminLogin from "@routes/admin/AdminLogin";
import AdminUser from "@routes/admin/AdminUser";
import AdminCreateUser from "@routes/admin/AdminCreateUser";
import AdminEditUser from "@routes/admin/AdminEditUser";
import AdminProgramme from "@routes/admin/AdminProgramme";
import AdminEditProgramme from "@routes/admin/AdminEditProgramme";
import AdminCreateProgramme from "@routes/admin/AdminCreateProgramme";
import AdminCourse from "@routes/admin/AdminCourse";
import AdminCreateCourse from "@routes/admin/AdminCreateCourse";
import AdminEditCourse from "@routes/admin/AdminEditCourse";
import AdminSubject from "@routes/admin/AdminSubject";
import AdminCreateSubject from "@routes/admin/AdminCreateSubject";
import AdminEditSubject from "@routes/admin/AdminEditSubject";
import AdminIntake from "@routes/admin/AdminIntake";
import AdminCreateIntake from "@routes/admin/AdminCreateIntake";
import AdminEditIntake from "@routes/admin/AdminEditIntake";
import AdminVenue from "@routes/admin/AdminVenue";
import AdminCreateVenue from "@routes/admin/AdminCreateVenue";
import AdminEditVenue from "@routes/admin/AdminEditVenue";
import StudentProfile from "@routes/StudentProfile";

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
<<<<<<< HEAD
    path: "/programme-history",
    element: <ProgrammeHistory />,
=======
    path: "/profile",
    element: <StudentProfile />,
>>>>>>> eb14eeb3923a4c3ed0bf12105434e9a156e5073c
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
  {
    path: "/admin/courses",
    element: <AdminCourse />,
  },
  {
    path: "/admin/courses/create",
    element: <AdminCreateCourse />,
  },
  {
    path: "/admin/courses/:id/edit",
    element: <AdminEditCourse />,
  },
  {
    path: "/admin/subjects",
    element: <AdminSubject />,
  },
  {
    path: "/admin/subjects/create",
    element: <AdminCreateSubject />,
  },
  {
    path: "/admin/subjects/:id/edit",
    element: <AdminEditSubject />,
  },
  {
    path: "/admin/intakes",
    element: <AdminIntake />,
  },
  {
    path: "/admin/intakes/create",
    element: <AdminCreateIntake />,
  },
  {
    path: "/admin/intakes/:id/edit",
    element: <AdminEditIntake />,
  },
  {
    path: "/admin/venues",
    element: <AdminVenue />,
  },
  {
    path: "/admin/venues/create",
    element: <AdminCreateVenue />,
  },
  {
    path: "/admin/venues/:id/edit",
    element: <AdminEditVenue />,
  },
];

export const Router = () => {
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};
