import React from 'react';
import { useLocation } from 'react-router-dom';
import SessionsButton from './SessionsButton.jsx';

export default function Header() {
  const location = useLocation();
  
  const getTitle = () => {
    if(location.pathname === '/settings') return 'SETTINGS';
    if(location.pathname === '/sessions') return 'SESSIONS';
    if(location.pathname === '/sessions/new') return 'SESSIONS';
    if(location.pathname === '/sessions/insights') return 'SESSIONS';
    return 'DASHBOARD';
  };

  return (
    <header className="w-full h-14 flex justify-start items-center px-4 border-b-4 border-gray-300 dark:border-[rgb(50,50,50)] bg-white dark:bg-[rgb(35,35,35)] z-50 shadow-2xl shadow-black/20">
      <h1 className="text-gray-900 dark:text-white font-extrabold font-sans text-3xl">{getTitle()}</h1>
      {(location.pathname === '/sessions' || location.pathname === '/sessions/new' || location.pathname === '/sessions/insights') && (
        <div className="ml-auto flex justify-center items-center">
          <SessionsButton text="History" link="/sessions" />
          <SessionsButton text="New" link="/sessions/new" />
          <SessionsButton text="Insights" link="/sessions/insights" />
        </div>
      )}
    </header>
  );
}