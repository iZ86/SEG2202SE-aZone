import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GuestLogin from "./routes/GuestLogin";

const routes = [
  {
    path: "/",
    element: <GuestLogin />,
  },
];

export const Router = () => {
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};
