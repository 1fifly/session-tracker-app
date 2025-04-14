import React, { useState } from 'react';

export default function TitleBar() {
  const isMac = window.process && window.process.platform === 'darwin';
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => window.electronAPI.minimize();
  const handleMaximize = () => {
    window.electronAPI.maximize();
    setIsMaximized(!isMaximized);
  };
  const handleClose = () => window.electronAPI.close();

  return (
    <div
      className="w-full h-8 flex items-center justify-between bg-white dark:bg-[rgb(40,40,40)] text-gray-900 dark:text-white pl-3 z-[51]"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium tracking-wide">Session Tracker</span>
      </div>
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        {isMac ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF3D2E] transition-colors focus:outline-none"
              title="Close"
            />
            <button
              onClick={handleMinimize}
              className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#1FAB2F] transition-colors focus:outline-none"
              title="Minimize"
            />
            <button
              onClick={handleMaximize}
              className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFA61A] transition-colors focus:outline-none"
              title="Maximize"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleMinimize}
              className="w-7 h-7 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors rounded-sm focus:outline-none relative group"
              title="Minimize"
            >
              <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor">
                <rect width="12" height="2" />
              </svg>
              <span className="absolute top-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                Minimize
              </span>
            </button>
            <button
              onClick={handleMaximize}
              className="w-7 h-7 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors rounded-sm focus:outline-none relative group"
              title={isMaximized ? "Restore Down" : "Maximize"}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="0.5" y="0.5" width="9" height="9" />
              </svg>
              <span className="absolute top-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                {isMaximized ? "Restore Down" : "Maximize"}
              </span>
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-colors rounded-sm focus:outline-none relative group"
              title="Close"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1L9 9M9 1L1 9" />
              </svg>
              <span className="absolute top-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                Close
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}