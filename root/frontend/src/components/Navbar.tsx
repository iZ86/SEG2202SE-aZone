import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, LogOutIcon, Moon, SettingsIcon, UserIcon } from "lucide-react";
import Avatar from "@components/Avatar";
import { AnimatePresence, motion } from "motion/react";
import type { User } from "@datatypes/userType";
import type { NavbarItem } from "@datatypes/navItemType";

export default function Navbar({
  children,
  page,
  user,
  navItems,
  handleSignOut
}: {
  children?: React.ReactNode;
  page: string;
  user: User;
  navItems: NavbarItem;
  handleSignOut: () => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  return (
    <nav className="flex items-center justify-between bg-blue-yinmn px-8 py-2 text-white shadow-md">
      <div
        className={`fixed inset-0 transition-opacity duration-300 z-40 ${isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setIsDropdownOpen(false)}
      />
      <div className="flex items-center gap-x-8">
        {children}
        <Link to={navItems.dashboard.to} className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white">
            <GraduationCap className="text-blue-yinmn w-6 h-6" />
          </div>
          <h1 className="font-semibold">aZone</h1>
        </Link>
      </div>

      <div className="flex items-center gap-4">

        <button className="p-2.5 text-gray-battleship hover:bg-blue-icy/20 hover:text-blue-yinmn rounded-xl transition-all">
          <Moon size={20} />
        </button>


        <Avatar user={user} isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen}  />


        <AnimatePresence>
          {isDropdownOpen && (
            <>

              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-8 top-16 mt-3 w-56 bg-blue-yinmn rounded-2xl shadow-xl border border-white p-2 z-40"
                id="user-profile-dropdown"
              >

                <div className="mb-2">
                  <Link
                    to={navItems.profile.to}
                    onClick={() => {

                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${page === 'profile'
                      ? 'bg-blue-icy/20 text-white font-bold'
                      : 'text-gray-battleship-200 hover:bg-blue-icy/15 hover:text-white font-semibold'
                      }`}
                    id="dropdown-profile-link"
                  >
                    <UserIcon size={16} className="" />
                    <p>Profile</p>
                  </Link>

                  <Link
                    to={navItems.settings.to}
                    onClick={() => {
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${page === 'settings'
                      ? 'bg-blue-icy/20 text-white font-bold'
                      : 'text-gray-battleship-200 hover:bg-blue-icy/15 hover:text-white font-semibold'
                      }`}
                    id="dropdown-settings-link"
                  >
                    <SettingsIcon size={16} className="" />
                    <p>Settings</p>
                  </Link>
                </div>

                <div className="border-t border-blue-icy/10 pt-2">
                  <Link
                    to={navItems.signOut.to}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-blue-icy/15 hover:text-red-600 transition-colors cursor-pointer font-semibold"
                    id="dropdown-logout-btn"
                  >
                    <LogOutIcon size={16} />
                    <p>Sign Out</p>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
