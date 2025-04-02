import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SessionsButton({ text, link }) {
  const location = useLocation();
  const isActive = location.pathname === link;

  return (
    <Link
      to={link}
      className={`text-gray-900 dark:text-white ml-8 text-[clamp(1rem,1.5vw,1.5vh)] font-semibold tracking-wide uppercase transition-all duration-300 hover:opacity-100 hover:text-[#6B5B95] hover:scale-105 ${
        isActive ? 'opacity-100 text-[#6B5B95] scale-105' : 'opacity-50'
      }`}
    >
      {text}
    </Link>
  );
}