import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function AdminSideBar({ page }: { page: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button inside Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-yinmn transition-colors cursor-pointer border-zinc-500"
        title="Open Menu"
      >
        <Menu size={32} />
      </button>

      {/* Overlay (click to close) */}
      <div
        className={`fixed inset-0 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-blue-yinmn shadow-xl z-50 transform transition-transform duration-300 text-white ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md bg-blue-yinmn transition-colors cursor-pointer border-zinc-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col mt-2">
          {[
            {
              to: "/admin",
              label: "Dashboard",
              key: "dashboard",
            },
            {
              to: "/admin/users",
              label: "Users",
              key: "users",
            },
            {
              to: "/admin/programmes",
              label: "Programmes",
              key: "programmes",
            },
            {
              to: "/admin/courses",
              label: "Courses",
              key: "courses",
            },
            {
              to: "/admin/subjects",
              label: "Subjects",
              key: "subjects",
            },
            {
              to: "/admin/intakes",
              label: "Intakes",
              key: "intakes",
            },
            {
              to: "/admin/venues",
              label: "Venues",
              key: "venues",
            },
          ].map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`${
                page === item.key
                  ? "font-bold bg-gray-800 text-white"
                  : "text-white"
              } text-white hover:bg-gray-700 px-6 py-3 transition`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Sign out button */}
          <button
            className="hover:text-red-400 hover:bg-gray-700 px-6 py-3 text-left transition cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Sign out
          </button>
        </nav>
      </aside>
    </>
  );
}
