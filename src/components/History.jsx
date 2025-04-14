import React, { useEffect, useState } from 'react';
import SessionData from '../components/SessionData.jsx';
import { FaTrash, FaEdit, FaTimes, FaCaretUp, FaCaretDown } from "react-icons/fa";
import SessionView from './SessionView.jsx';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await window.electronAPI.loadSessions();
        setSessions(data);
      } catch (err) {
        console.error("Error loading sessions:", err);
      }
    };
    loadData();
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedSessions = React.useMemo(() => {
    let sortableSessions = [...sessions];
    if (sortConfig.key) {
      sortableSessions.sort((a, b) => {
        const aValue = sortConfig.key === 'tags' ? (Array.isArray(a[sortConfig.key]) ? a[sortConfig.key].join(',') : a[sortConfig.key] || '') : a[sortConfig.key];
        const bValue = sortConfig.key === 'tags' ? (Array.isArray(b[sortConfig.key]) ? b[sortConfig.key].join(',') : b[sortConfig.key] || '') : b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableSessions;
  }, [sessions, sortConfig]);

  const filteredSessions = sortedSessions.filter(session =>
    Object.values(session).some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleViewSession = (session) => setSelectedSession(session);
  const handleDeleteSession = async (id) => {
    if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      try {
        await window.electronAPI.deleteSession(id);
        setSessions(sessions.filter(session => session.id !== id));
      } catch (err) {
        console.error("Error deleting session:", err);
      }
    }
  };
  const handleDeleteAll = async () => {
    if (sessions.length === 0) return;
    if (window.confirm("Are you sure you want to delete ALL sessions? This action cannot be undone.")) {
      try {
        await window.electronAPI.deleteAllSessions();
        setSessions([]);
      } catch (err) {
        console.error("Error deleting all sessions:", err);
      }
    }
  };

  const handleUpdateSession = async (updatedSession) => {
    try {
      await window.electronAPI.saveSession(updatedSession);
      setSessions(sessions.map(session => 
        session.id === updatedSession.id ? { ...session, ...updatedSession } : session
      ));
      setSelectedSession(null);
    } catch (err) {
      console.error("Error updating session:", err);
    }
  };

  const SortArrows = ({ columnKey }) => (
    <span className="ml-1 flex flex-col items-center">
      <FaCaretUp 
        className={`text-[20px] ${
          sortConfig.key === columnKey && sortConfig.direction === 'asc' 
            ? 'text-[#6B5B95]' 
            : 'text-gray-400 dark:text-gray-500'
        }`}
      />
      <FaCaretDown 
        className={`text-[20px] -mt-3 ${
          sortConfig.key === columnKey && sortConfig.direction === 'desc' 
            ? 'text-[#6B5B95]' 
            : 'text-gray-400 dark:text-gray-500'
        }`}
      />
    </span>
  );

  return (
    <>
      {selectedSession && (
        <SessionView 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)}
          onConfirm={handleUpdateSession}
        />
      )}
      <div className="w-11/12 h-14 flex justify-between items-center relative overflow-visible">
        <input
          type="search"
          name="search"
          id="search"
          placeholder="Search.."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-3xl w-32 h-10 bg-white dark:bg-[rgb(40,40,40)] text-gray-900 dark:text-white border-2 border-gray-300 dark:border-[rgb(50,50,50)] focus:border-[#6B5B95] focus:outline-none focus:ring-2 focus:ring-[#6B5B95] px-4 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300"
        />
        <button
          onClick={handleDeleteAll}
          disabled={sessions.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-3xl bg-red-600 text-white font-semibold text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300
            ${sessions.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 hover:scale-105'}`}
        >
          <FaTimes /> Delete All
        </button>
      </div>
      <div className="w-11/12 h-5/6 rounded-3xl border-2 border-gray-300 dark:border-[rgb(50,50,50)] bg-white dark:bg-[rgb(40,40,40)] overflow-hidden shadow-md">
        <div className="w-full h-max py-2 px-6 flex text-gray-900 dark:text-white font-semibold text-[clamp(1rem,1.5vw,1.5vh)] border-b-2 border-gray-300 dark:border-[rgb(50,50,50)] sticky top-0 bg-white dark:bg-[rgb(40,40,40)] tracking-wide uppercase">
          <div className="w-[10%] h-full cursor-pointer flex items-center" onClick={() => handleSort('id')}>
            # <SortArrows columnKey="id" />
          </div>
          <div className="w-[15%] h-full cursor-pointer flex items-center" onClick={() => handleSort('timestamp')}>
            Date <SortArrows columnKey="timestamp" />
          </div>
          <div className="w-[15%] h-full cursor-pointer flex items-center" onClick={() => handleSort('length')}>
            Length <SortArrows columnKey="length" />
          </div>
          <div className="w-[20%] h-full cursor-pointer flex items-center" onClick={() => handleSort('title')}>
            Name <SortArrows columnKey="title" />
          </div>
          <div className="w-[15%] h-full cursor-pointer flex items-center" onClick={() => handleSort('category')}>
            Category <SortArrows columnKey="category" />
          </div>
          <div className="w-[25%] h-full cursor-pointer flex items-center" onClick={() => handleSort('tags')}>
            Tags <SortArrows columnKey="tags" />
          </div>
          <FaEdit className="mr-4 opacity-0" />
          <FaTrash className="opacity-0" />
        </div>
        <div className="w-full h-full overflow-y-auto">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session, index) => (
              <SessionData 
                key={session.id} 
                id={session.id} 
                date={session.timestamp.split('T')[0]}
                length={session.length} 
                name={session.title} 
                category={session.category}
                tags={session.tags}
                onView={() => handleViewSession(session)}
                onDelete={() => handleDeleteSession(session.id)}
                searchTerm={searchTerm}
              />
            ))
          ) : (
            <p className="text-gray-900 dark:text-white p-4 text-[clamp(0.9rem,1.5vw,1.5vh)]">
              {searchTerm ? 'No matching sessions found' : 'No sessions found'}
            </p>
          )}
        </div>
      </div>
    </>
  );
}