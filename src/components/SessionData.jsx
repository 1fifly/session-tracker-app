import React from 'react';
import { FaTrash, FaEdit } from "react-icons/fa";

export default function SessionData({ id, date, length, name, category, onView, onDelete }) {
  return (
    <article className="w-full h-max flex justify-start items-center border-b-2 border-gray-300 dark:border-[rgb(50,50,50)] py-4 px-6 text-gray-900 dark:text-white">
      <div className="w-[10%] h-full">{id}</div>
      <div className="w-[20%] h-full">{date}</div>
      <div className="w-[20%] h-full">{length}</div>
      <div className="w-[30%] h-full">{name}</div>
      <div className="w-[20%] h-full">{category}</div>
      <FaEdit 
        className="mr-4 text-[#6B5B95] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
      />
      <FaTrash 
        className="text-red-600 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      />
    </article>
  );
}