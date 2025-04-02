import React, { useState } from 'react';
import { FaTag, FaFolder, FaPen, FaTimes, FaCheck, FaCalendarAlt, FaClock, FaAlignLeft, FaStickyNote, FaCheckSquare } from 'react-icons/fa';

export default function SessionView({ session, onClose, onConfirm, readOnly = false }) {
  const [sessionData, setSessionData] = useState({
    id: session?.id || null,
    title: session?.title || 'New Session',
    description: session?.description || '',
    notes: session?.notes || '',
    category: session?.category || '',
    tags: session?.tags || '',
    date: session?.timestamp?.split(' ')[0] || new Date().toISOString().split('T')[0],
    length: session?.length || '00:00:00',
    todos: Array.isArray(session?.todos) ? session.todos : (session?.todos ? JSON.parse(session.todos) : []),
  });

  const handleChange = (field) => (e) => {
    if (!readOnly) {
      setSessionData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    }
  };

  const handleApply = async () => {
    try {
      const dataToSave = {
        ...sessionData,
        todos: JSON.stringify(sessionData.todos),
      };

      if (onConfirm) {
        await onConfirm(dataToSave);
      } else if (!readOnly) {
        await window.electronAPI.saveSession(dataToSave);
        onClose();
      }
    } catch (err) {
      console.error('Error saving session:', err);
    }
  };

  return (
    <div className="absolute w-screen h-screen flex justify-center items-center z-50 overflow-visible">
      <div className="absolute w-full h-full bg-black/50 dark:bg-black/50 backdrop-blur-sm overflow-visible"></div>

      <div className="relative w-1/3 min-h-[66vh] max-h-[90vh] bg-white dark:bg-[rgb(40,40,40)] rounded-xl border-2 border-gray-300 dark:border-[rgb(50,50,50)] shadow-md z-50 flex flex-col text-gray-900 dark:text-white font-semibold overflow-visible">
        <div className="flex-1 overflow-y-auto space-y-4 overflow-visible p-6">
          <div className="flex flex-col gap-y-2 overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] flex items-center gap-2 overflow-visible">
              <FaPen className="text-gray-600 dark:text-gray-400" /> Title
            </h4>
            {readOnly ? (
              <div className="w-full h-10 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg text-gray-900 dark:text-white px-2 py-2 text-[clamp(0.9rem,1.5vw,1.5vh)] flex items-center shadow-md overflow-visible">
                {sessionData.title}
              </div>
            ) : (
              <input
                type="text"
                value={sessionData.title}
                onChange={handleChange('title')}
                className="w-full h-10 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-2 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300 overflow-visible"
                placeholder="Study Session..."
              />
            )}
          </div>

          <div className="flex flex-col gap-y-2 overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] flex items-center gap-2 overflow-visible">
              <FaAlignLeft className="text-gray-600 dark:text-gray-400" /> Description
            </h4>
            {readOnly ? (
              <div className="w-full h-24 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg text-gray-900 dark:text-white px-2 py-3 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md overflow-visible">
                {sessionData.description || 'No description'}
              </div>
            ) : (
              <textarea
                value={sessionData.description}
                onChange={handleChange('description')}
                className="w-full h-24 bg-gray-100 dark:bg-[rgb(45,45,45)] resize-none rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-2 py-3 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300 overflow-visible"
                placeholder="Focus on React components, write report..."
              />
            )}
          </div>

          <div className="flex flex-col gap-y-2 overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] flex items-center gap-2 overflow-visible">
              <FaStickyNote className="text-gray-600 dark:text-gray-400" /> Notes
            </h4>
            {readOnly ? (
              <div className="w-full h-24 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg text-gray-900 dark:text-white px-2 py-3 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md overflow-visible">
                {sessionData.notes || 'No notes'}
              </div>
            ) : (
              <textarea
                value={sessionData.notes}
                onChange={handleChange('notes')}
                className="w-full h-24 bg-gray-100 dark:bg-[rgb(45,45,45)] resize-none rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-2 py-3 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300 overflow-visible"
                placeholder="Meeting summary, study progress..."
              />
            )}
          </div>

          <div className="flex flex-col gap-y-2 overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] flex items-center gap-2 overflow-visible">
              <FaCheckSquare className="text-gray-600 dark:text-gray-400" /> To-Do
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto overflow-visible">
              {sessionData.todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-[rgb(45,45,45)] shadow-md transition-all duration-300 ${todo.completed ? 'border-2 border-[#584A7A]/50 dark:border-[#6B5B95]/50' : 'border-2 border-gray-300 dark:border-[rgb(50,50,50)]'} overflow-visible`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${todo.completed ? 'bg-[#584A7A]0 dark:bg-[#6B5B95]' : 'border-2 border-gray-400 dark:border-gray-500'} overflow-visible`}>
                    {todo.completed && <span className="text-white text-xs overflow-visible">✓</span>}
                  </div>
                  <span className={`flex-1 text-[clamp(0.9rem,1.5vw,1.5vh)] ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'} overflow-visible`}>
                    {todo.text || 'No task description'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-y-2 overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] flex items-center gap-2 overflow-visible">
              <FaFolder className="text-gray-600 dark:text-gray-400" /> Category
            </h4>
            {readOnly ? (
              <div className="w-full h-10 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg text-gray-900 dark:text-white px-2 py-2 text-[clamp(0.9rem,1.5vw,1.5vh)] flex items-center shadow-md overflow-visible">
                {sessionData.category || 'Uncategorized'}
              </div>
            ) : (
              <input
                type="text"
                value={sessionData.category}
                onChange={handleChange('category')}
                className="w-full h-10 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-2 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300 overflow-visible"
                placeholder="Work, Study, Exercise..."
              />
            )}
          </div>

          <div className="flex flex-col gap-y-2 overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] flex items-center gap-2 overflow-visible">
              <FaTag className="text-gray-600 dark:text-gray-400" /> Tags
            </h4>
            {readOnly ? (
              <div className="w-full h-10 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg text-gray-900 dark:text-white px-2 py-2 text-[clamp(0.9rem,1.5vw,1.5vh)] flex items-center shadow-md overflow-visible">
                {sessionData.tags || 'No tags'}
              </div>
            ) : (
              <input
                type="text"
                value={sessionData.tags}
                onChange={handleChange('tags')}
                className="w-full h-10 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-2 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300 overflow-visible"
                placeholder="JavaScript, Project A..."
              />
            )}
          </div>

          <div className="flex flex-col gap-y-2 overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] flex items-center gap-2 overflow-visible">
              <FaCalendarAlt className="text-gray-600 dark:text-gray-400" /> Date
            </h4>
            <div className="w-full h-10 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg border-none text-gray-900 dark:text-white px-2 py-2 text-[clamp(0.9rem,1.5vw,1.5vh)] flex items-center shadow-md overflow-visible">
              {sessionData.date}
            </div>
          </div>

          <div className="flex flex-col gap-y-2 overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] flex items-center gap-2 overflow-visible">
              <FaClock className="text-gray-600 dark:text-gray-400" /> Length
            </h4>
            <div className="w-full h-10 bg-gray-100 dark:bg-[rgb(45,45,45)] rounded-lg border-none text-gray-900 dark:text-white px-2 py-2 text-[clamp(0.9rem,1.5vw,1.5vh)] flex items-center shadow-md overflow-visible">
              {sessionData.length}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-x-4 overflow-visible">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-900 dark:text-white bg-gray-200 dark:bg-[rgb(40,40,40)] rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-[rgb(50,50,50)] hover:scale-105 transition-all duration-300 text-[clamp(0.9rem,1.5vw,1.5vh)] font-semibold overflow-visible mb-6 mr-6"
          >
            <FaTimes /> Close
          </button>
          {!readOnly && (
            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-4 py-2 text-white bg-[#6B5B95] dark:bg-[#6B5B95] rounded-lg shadow-md hover:bg-[#584A7A] dark:hover:bg-[#584A7A] hover:scale-105 transition-all duration-300 text-[clamp(0.9rem,1.5vw,1.5vh)] font-semibold overflow-visible mb-6 mr-6"
            >
              <FaCheck /> {onConfirm ? 'Confirm End' : 'Apply'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}