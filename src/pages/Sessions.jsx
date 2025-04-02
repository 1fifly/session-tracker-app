import React from 'react';
import { useLocation } from 'react-router-dom';
import History from '../components/History.jsx';
import NewSession from '../components/NewSession.jsx';
import Insights from '../components/Insights.jsx';

export default function Sessions() {
  const location = useLocation();

  return (
    <div className="flex-1 flex justify-center items-center flex-col text-gray-900 dark:text-white">
      {location.pathname === '/sessions' && <History />}
      {location.pathname === '/sessions/new' && <NewSession />}
      {location.pathname === '/sessions/insights' && <Insights />}
    </div>
  );
}