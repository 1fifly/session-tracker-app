import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCalendar, FaHome } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { to: '/sessions', icon: FaCalendar },
    { to: '/', icon: FaHome },
    { to: '/settings', icon: FaGear },
  ];

  return (
    <footer className="w-full h-14 flex justify-center items-end z-40">
      <div className="w-40 h-14 bg-white dark:bg-[rgb(40,40,40)] border-t-4 border-gray-300 dark:border-[rgb(45,45,45)] rounded-t-[3rem] flex justify-center items-end shadow-md">
        {navItems.map((item, index) => {
          const isActive = item.to === '/sessions' 
            ? location.pathname.startsWith('/sessions') 
            : location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`text-gray-900 dark:text-white flex items-center justify-center transition-all duration-300 hover:opacity-100 hover:text-[#6B5B95] hover:scale-110 ${
                isActive ? 'opacity-100 text-[#6B5B95] scale-110' : 'opacity-50'
              } ${index === 1 ? 'text-5xl mx-1' : 'text-3xl pb-1'}`}
            >
              <item.icon />
            </Link>
          );
        })}
      </div>
    </footer>
  );
}