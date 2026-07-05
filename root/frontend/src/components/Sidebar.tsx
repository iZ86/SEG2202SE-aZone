import type { NavItem } from '@datatypes/navItemType';
import { GraduationCap, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link } from "react-router-dom";


export default function SideBar({ page, navItems }: { page: string, navItems: NavItem[] }) {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
     
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-yinmn transition-colors cursor-pointer border-zinc-500"
        title="Open Menu"
      >
        <Menu size={32} />
      </button>

      
      <div
        className={`fixed inset-0 backdrop-blur-sm transition-opacity duration-300 z-40 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setIsOpen(false)}
      />
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-blue-icy/20 shadow-xl z-50 transform transition-transform duration-300 flex flex-col p-6 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-yinmn rounded-xl flex items-center justify-center">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-blue-yinmn">aZone</h1>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-blue-icy/20 hover:text-blue-yinmn ${page === item.key ? 'bg-blue-icy/30 text-blue-yinmn font-bold' : 'text-gray-battleship font-semibold'}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon ? <item.icon className="w-5 h-5" /> : ""}
              <p>{item.label}</p>
            </Link>
          ))}
        </nav>
      </motion.aside>
    </div >

  );
};
