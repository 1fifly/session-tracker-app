import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SessionTimer() {
  const [sessionData, setSessionData] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [notifications, setNotifications] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateSession = () => {
        const savedSession = localStorage.getItem('activeSession');
        setTimeout(() => {
          setSessionData(savedSession ? JSON.parse(savedSession) : null);
        }, 0);
      };

    updateSession();
    window.addEventListener('storage', updateSession);
    window.addEventListener('sessionUpdated', updateSession);

    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);

    window.electronAPI.loadSettings().then(settings => {
      setNotifications(settings.notifications);
    });

    return () => {
      window.removeEventListener('storage', updateSession);
      window.removeEventListener('sessionUpdated', updateSession);
      clearInterval(interval);
    };
  }, []);

  const formatTimeToHHMMSS = (time) => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const endSession = () => {
    if (!sessionData) return;
  
    const duration = (sessionData.timeLimit.hours * 3600 +
                      sessionData.timeLimit.minutes * 60 +
                      sessionData.timeLimit.seconds) * 1000;
    const elapsedTime = duration;
    const length = formatTimeToHHMMSS(elapsedTime);
  
    const sessionToConfirm = {
      ...sessionData,
      length,
    };
  
    localStorage.setItem('pendingConfirmation', JSON.stringify(sessionToConfirm));
    localStorage.removeItem('activeSession');
    window.dispatchEvent(new Event('sessionUpdated'));
  
    if (notifications) {
      new Notification('Session Ended', {
        body: `${sessionData.title || 'Unnamed Session'} has ended.`,
      });
    }
    navigate('/sessions/new');
  };

  useEffect(() => {
    if (sessionData && sessionData.isRunning && sessionData.sessionEndRule === 'timer') {
      const duration = (sessionData.timeLimit.hours * 3600 +
                       sessionData.timeLimit.minutes * 60 +
                       sessionData.timeLimit.seconds) * 1000;
      const endTime = sessionData.startTime + duration;
      if (currentTime >= endTime) {
        endSession();
      }
    }
  }, [currentTime, sessionData]);

  if (!sessionData || !sessionData.isRunning || location.pathname === '/sessions/new') {
    return null;
  }

  const elapsedTime = currentTime - sessionData.startTime;
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  let remainingTimeDisplay = '';
  if (sessionData.sessionEndRule === 'timer') {
    const duration = (sessionData.timeLimit.hours * 3600 +
                     sessionData.timeLimit.minutes * 60 +
                     sessionData.timeLimit.seconds) * 1000;
    const remainingTime = Math.max(0, sessionData.startTime + duration - currentTime);
    remainingTimeDisplay = ` (Remaining: ${formatTime(remainingTime)})`;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-[rgb(40,40,40)] p-4 rounded-lg shadow-lg z-50 border-2 border-gray-300 dark:border-[rgb(50,50,50)]">
      <div className="text-gray-900 dark:text-white font-semibold">
        {sessionData.title || 'Active Session'}: {formatTime(elapsedTime)}{remainingTimeDisplay}
      </div>
    </div>
  );
}