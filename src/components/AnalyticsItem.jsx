import React from 'react';
import { FaClock, FaList, FaHourglassHalf, FaCalendarAlt, FaTrophy, FaHourglassStart } from 'react-icons/fa';

const iconMap = {
  FaClock: FaClock,
  FaList: FaList,
  FaHourglassHalf: FaHourglassHalf,
  FaCalendarAlt: FaCalendarAlt,
  FaTrophy: FaTrophy,
  FaHourglassStart: FaHourglassStart,
};

export default function AnalyticsItem({ text, info, icon, className }) {
  const Icon = iconMap[icon];

  return (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-lg bg-white dark:bg-[rgb(40,40,40)] p-2 shadow-md transition-all duration-300 hover:bg-gray-100 dark:hover:bg-[rgb(50,50,50)] h-[min(14.75vw,14.75vh)] overflow-visible lg-h:h-[min(15vw,15vh)] ${className}`}> 
      {Icon && <Icon className="flex-shrink-0 text-[clamp(1.25rem,3vw,3vh)] text-[#6B5B95]" />}
      <div className="flex flex-col items-center text-center overflow-visible">
        <p className="text-[clamp(0.75rem,2vw,2vh)] font-light text-gray-500 dark:text-gray-400">{text}</p>
        <p className="text-[clamp(0.875rem,2.5vw,2.5vh)] font-semibold text-gray-900 dark:text-white">{info}</p>
      </div>
    </div>
  );
}