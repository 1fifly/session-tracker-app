import React, { useEffect, useState } from 'react';
import AnalyticsItem from '../components/AnalyticsItem.jsx';
import Recent from '../components/Recent.jsx';
import { Link } from 'react-router-dom';
import SessionView from '../components/SessionView.jsx';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalTime: '00:00:00',
    sessionCount: 0,
    avgDuration: '00:00:00',
    totalDays: 0,
    longestSession: '00:00:00',
    shortestSession: '00:00:00',
    mostActiveDay: 'None',
    sessionStreak: '0',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const sessionData = await window.electronAPI.loadSessions();
        const sortedSessions = sessionData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setSessions(sortedSessions.slice(0, 5));

        if (sessionData.length > 0) {
          const totalSeconds = sessionData.reduce((sum, session) => {
            const [h, m, sec] = session.length.split(':').map(part => parseInt(part) || 0);
            return sum + (h * 3600) + (m * 60) + sec;
          }, 0);

          const durations = sessionData.map(session => {
            const [h, m, sec] = session.length.split(':').map(part => parseInt(part) || 0);
            return (h * 3600) + (m * 60) + sec;
          });
          const longest = Math.max(...durations);
          const shortest = Math.min(...durations);

          const dayCount = sessionData.reduce((acc, s) => {
            const day = new Date(s.timestamp).toLocaleString('en-us', { weekday: 'long' });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {});
          const mostActiveDay = Object.entries(dayCount)
            .reduce((a, b) => (a[1] > b[1] ? a : b), ['None', 0])[0];

          const sortedDates = [...new Set(sessionData.map(s => new Date(s.timestamp).toDateString()))].sort();
          let streak = sortedDates.length > 0 ? 1 : 0;
          for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
            if (diffDays === 1) streak++;
            else if (diffDays > 1) break;
          }

          const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const sec = Math.floor(seconds % 60);
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
          };

          setAnalytics({
            totalTime: formatTime(totalSeconds),
            sessionCount: sessionData.length,
            avgDuration: formatTime(Math.floor(totalSeconds / sessionData.length) || 0),
            totalDays: new Set(sessionData.map(s => new Date(s.timestamp).toDateString())).size,
            longestSession: formatTime(longest),
            shortestSession: formatTime(shortest),
            mostActiveDay: mostActiveDay,
            sessionStreak: streak.toString(),
          });
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    };
    loadData();
  }, []);

  const recentSlots = Array(5).fill(null).map((_, index) => {
    if (index < sessions.length) {
      return sessions[index];
    }
    return {
      id: `empty-${index}`,
      title: 'No Session',
      category: '-',
      timestamp: '-',
      length: '-',
      isEmpty: true,
    };
  });

  return (
    <div className="flex-1 p-3 text-gray-900 dark:text-white overflow-y-auto">
      {selectedSession && (
        <SessionView
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          readOnly={true}
        />
      )}
      <div className="flex h-full w-full gap-x-4">
        <div className="flex w-1/2 flex-col items-start justify-center gap-y-2 h-full">
          <h2 className="text-[clamp(1.25rem,3vw,3vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] ml-[10%]">
            Recent Sessions
          </h2>
          {recentSlots.map((session) => (
            <Recent
              key={session.id}
              id={session.id}
              title={session.title}
              category={session.category}
              date={session.timestamp.split(' ')[0]}
              length={session.length}
              onView={session.isEmpty ? null : () => setSelectedSession(session)}
              className={session.isEmpty ? 'opacity-50 cursor-default' : ''}
            />
          ))}
          <Link
            to="/sessions/new"
            className="ml-[10%] flex h-[clamp(3rem,8vw,8vh)] w-2/3 items-center justify-center rounded-lg bg-gray-100 text-gray-900 dark:bg-[rgb(40,40,40)] dark:text-white text-[clamp(2rem,5vw,5vh)] font-semibold shadow-md transition-all duration-300 dark:hover:bg-[rgb(50,50,50)] hover:scale-105"
          >
            +
          </Link>
        </div>

        <div className="flex w-1/2 flex-col items-start justify-center gap-y-0 h-full">
          <h2 className="text-[clamp(1.25rem,3vw,3vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] ml-[10%]">
            Analytics
          </h2>
          <div className="grid w-full grid-cols-2 gap-2 px-[10%] grid-rows-[repeat(4,1fr)]">
            <AnalyticsItem text="Total Time" info={analytics.totalTime} icon="FaClock" />
            <AnalyticsItem text="Sessions Count" info={analytics.sessionCount} icon="FaList" />
            <AnalyticsItem text="Average Duration" info={analytics.avgDuration} icon="FaHourglassHalf" />
            <AnalyticsItem text="Total Days Tracked" info={analytics.totalDays} icon="FaCalendarAlt" />
            <AnalyticsItem text="Longest Session" info={analytics.longestSession} icon="FaTrophy" />
            <AnalyticsItem text="Shortest Session" info={analytics.shortestSession} icon="FaTrophy" />
            <AnalyticsItem text="Most Active Day" info={analytics.mostActiveDay} icon="FaHourglassStart" />
            <AnalyticsItem text="Session Streak" info={analytics.sessionStreak} icon="FaHourglassStart" />
          </div>
        </div>
      </div>
    </div>
  );
}