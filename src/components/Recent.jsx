import React from 'react';
import { FaEye } from "react-icons/fa";

export default function Recent({ 
  id, 
  title = "Unnamed Session", 
  category = "Uncategorized", 
  date = "No Date", 
  length = "00:00:00",
  onView,
  className
}) {
  const handleViewSession = (e) => {
    e.stopPropagation();
    if (id && onView) {
      onView();
    }
  };

  return (
    <div
      className={`h-[min(10vw,10vh)] w-2/3 bg-white dark:bg-[rgb(40,40,40)] rounded-lg ml-[10%] flex px-3 shadow-md hover:bg-gray-100 dark:hover:bg-[rgb(50,50,50)] transition-all duration-300 cursor-pointer ${className}`}
      onClick={handleViewSession}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleViewSession(e)}
      aria-label={`View session: ${title}`}
    >
      <div className="w-1/2 h-full flex flex-col justify-start items-start overflow-hidden mt-[1%]">
        <p className="text-gray-900 dark:text-white font-semibold text-[min(2.5vw,2.5vh)] truncate">{title || "Unnamed Session"}</p>
        <p className="text-gray-600 dark:text-gray-400 font-normal text-[min(2vw,2vh)] truncate">{category || "Uncategorized"}</p>
      </div>

      <div className="w-1/2 h-full flex flex-col justify-start items-end gap-1 mt-[2%]">
        <p className="text-gray-500 font-light text-[min(1.5vw,1.5vh)] leading-none overflow-visible">{date || "No Date"}</p>
        <p className="text-gray-500 font-light text-[min(1.5vw,1.5vh)] leading-none overflow-visible">{length || "00:00:00"}</p>
        <button
          onClick={handleViewSession}
          className="flex items-center justify-center w-[min(2vw,2vh)] h-[min(2vw,2vh)] bg-gray-200 dark:bg-[rgb(50,50,50)] rounded-full hover:bg-[#6B5B95] hover:shadow-sm hover:scale-105 transition-all duration-200 mt-auto mb-[7.5%] overflow-visible"
          aria-label="View session details"
        >
          <FaEye className="text-[#6B5B95] hover:text-white dark:text-[#6B5B95] dark:hover:text-white w-full h-full transition-colors duration-200" />
        </button>
      </div>
    </div>
  );
}