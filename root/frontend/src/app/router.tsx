import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import GuestLogin from "@routes/GuestLogin";
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
import StudentProfile from "@routes/student/StudentProfile";
import StudentProvider from "../features/student/components/Provider";
import AdminProvider from "@features/admin/components/Provider";
import AdminProfile from "@routes/admin/AdminProfile";
import StudentDashboard from "@routes/student/StudentDashboard";
import StudentEnrollment from "@routes/student/StudentEnrollment";
import StudentProgrammeHistory from "@routes/student/StudentProgrammeHistory";
import AdminEnrollment from "@routes/admin/AdminEnrollment";
import AdminCreateEnrollment from "@routes/admin/AdminCreateEnrollment";
import AdminEditEnrollment from "@routes/admin/AdminEditEnrollment";
import AdminLecturer from "@routes/admin/AdminLecturer";
import AdminCreateLecturer from "@routes/admin/AdminCreateLecturer";
import AdminEditLecturer from "@routes/admin/AdminEditLecturer";

const StudentLayout = () => (
  <StudentProvider>
    <Outlet />
  </StudentProvider>
);

const AdminLayout = () => (
  <AdminProvider>
    <Outlet />
  </AdminProvider>
);

const routes = [
  // Guest routes
  {
    path: "/login",
    element: <GuestLogin />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },

  // Student routes
  {
    path: "/",
    element: <StudentLayout />,
    children: [
      {
        path: "/",
        element: <StudentDashboard />,
      },
      {
        path: "/enrollment",
        element: <StudentEnrollment />,
      },
      {
        path: "/programme-history",
        element: <StudentProgrammeHistory />,
      },
      {
        path: "/profile",
        element: <StudentProfile />,
      },
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
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
      {
        path: "/admin/lecturers",
        element: <AdminLecturer />,
      },
      {
        path: "/admin/lecturers/create",
        element: <AdminCreateLecturer />,
      },
      {
        path: "/admin/lecturers/:id/edit",
        element: <AdminEditLecturer />,
      },
      {
        path: "/admin/enrollments",
        element: <AdminEnrollment />,
      },
      {
        path: "/admin/enrollments/create",
        element: <AdminCreateEnrollment />,
      },
      {
        path: "/admin/enrollments/:id/edit",
        element: <AdminEditEnrollment />,
      },
      {
        path: "/admin/profile",
        element: <AdminProfile />,
      },
    ],
  },
];

export const Router = () => {
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};
