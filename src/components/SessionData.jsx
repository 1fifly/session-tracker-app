import React from 'react';
import { FaTrash, FaEdit } from "react-icons/fa";

export default function SessionData({ id, date, length, name, category, tags, onView, onDelete, searchTerm }) {
  const highlightText = (text) => {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-[#6B5B95] bg-opacity-20 text-[#6B5B95]">{part}</span>
      ) : (
        part
      )
    );
  };

  const tagsString = tags && typeof tags === 'string' && tags.trim() ? tags : 'No tags';

  return (
    <article className="w-full h-max flex justify-start items-center border-b-2 border-gray-300 dark:border-[rgb(50,50,50)] py-4 px-6 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[rgb(45,45,45)] transition-colors duration-200">
      <div className="w-[10%] h-full">{highlightText(id.toString())}</div>
      <div className="w-[15%] h-full">{highlightText(date)}</div>
      <div className="w-[15%] h-full">{highlightText(length)}</div>
      <div className="w-[20%] h-full">{highlightText(name)}</div>
      <div className="w-[15%] h-full">{highlightText(category)}</div>
      <div className="w-[25%] h-full">{highlightText(tagsString)}</div>
      <FaEdit 
        className="mr-4 text-[#6B5B95] cursor-pointer hover:text-[#5A4A84] transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
      />
      <FaTrash 
        className="text-red-600 cursor-pointer hover:text-red-700 transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      />
    </article>
  );
}