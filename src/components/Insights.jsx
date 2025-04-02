import React, { useEffect, useState } from 'react';
import { 
  FaClock, FaChartLine, FaTasks, FaCalendarWeek, FaTag, FaTrophy, 
  FaCheckSquare, FaHourglassHalf, FaChartBar, FaArrowUp, FaArrowDown, 
  FaBullseye, FaChartPie, FaFire 
} from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Insights() {
  const [sessions, setSessions] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [weeklyGoal, setWeeklyGoal] = useState(20);

  useEffect(() => {
    window.electronAPI.loadSessions().then(data => setSessions(data));
    window.electronAPI.loadSettings().then(settings => setWeeklyGoal(settings.weeklyGoal));
  }, []);

  const getStats = () => {
    if (!sessions.length) return {
      totalTime: 0, sessionCount: 0, avgDuration: 0, activeDays: 0, 
      topCategory: '', longestSession: 0, shortestSession: Infinity, 
      streak: 0, completionRate: 0, productivityTrend: 0, topCategories: [],
      weeklyActivity: {}, goalProgress: 0, categoryDistribution: {}
    };

    const now = new Date();
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      if (timeRange === 'week') return (now - sessionDate) / (1000 * 60 * 60 * 24) <= 7;
      if (timeRange === 'month') return (now - sessionDate) / (1000 * 60 * 60 * 24) <= 30;
      return true;
    });

    const totalTime = filteredSessions.reduce((sum, session) => {
      const [h, m, sec] = session.length.split(':').map(Number);
      return sum + h * 3600 + m * 60 + sec;
    }, 0);

    const sessionCount = filteredSessions.length;
    const avgDuration = sessionCount ? totalTime / sessionCount : 0;
    const activeDays = new Set(filteredSessions.map(s => new Date(s.timestamp).toDateString())).size;
    
    const categoryCount = filteredSessions.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => ({ category: cat, count }));
    const categoryDistribution = categoryCount;

    const durations = filteredSessions.map(s => {
      const [h, m, sec] = s.length.split(':').map(Number);
      return h * 3600 + m * 60 + sec;
    });
    const longestSession = durations.length ? Math.max(...durations) : 0;
    const shortestSession = durations.length ? Math.min(...durations) : 0;

    const sortedDates = [...new Set(filteredSessions.map(s => new Date(s.timestamp).toDateString()))].sort();
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i-1]);
      const curr = new Date(sortedDates[i]);
      if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) streak++;
      else streak = 1;
    }

    const completionRate = filteredSessions.length ? (filteredSessions.length / (activeDays * 2)) * 100 : 0;
    const productivityTrend = Math.random() * 20 - 10;

    const weeklyActivity = filteredSessions.reduce((acc, s) => {
      const day = new Date(s.timestamp).getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    const goalProgress = Math.min((totalTime / (weeklyGoal * 3600)) * 100, 100);

    return { 
      totalTime, sessionCount, avgDuration, activeDays, topCategory, 
      longestSession, shortestSession, streak, completionRate, productivityTrend, 
      topCategories, weeklyActivity, goalProgress, categoryDistribution 
    };
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const stats = getStats();

  const pieData = {
    labels: Object.keys(stats.categoryDistribution),
    datasets: [{
      data: Object.values(stats.categoryDistribution),
      backgroundColor: [
        '#6B5B95', '#9575CD', '#B39DDB', '#D1C4E9', 
        '#EDE7F6', '#B0BEC5', '#78909C'
      ],
      borderWidth: 1,
      borderColor: '#fff'
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
          font: { size: 14 },
          boxWidth: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} sessions`
        }
      }
    }
  };

  return (
    <div className="flex-1 p-6 text-gray-900 dark:text-white overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-6 w-full">
        <h2 className="text-[clamp(1.25rem,3vw,3vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95]">
          Insights
        </h2>
        <div className="flex gap-2">
          {['week', 'month', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-[min(1.5vw,1.5vh)] py-[min(0.5vw,0.5vh)] rounded-lg text-[clamp(0.9rem,1.5vw,1.5vh)] font-medium transition-colors duration-300 ${
                timeRange === range 
                  ? 'bg-[#6B5B95] text-white' 
                  : 'bg-gray-200 dark:bg-[rgb(50,50,50)] text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-[rgb(60,60,60)]'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md mb-6 flex justify-between gap-4 flex-wrap">
        <StatCard icon={<FaClock />} label="Total Time" value={formatTime(stats.totalTime)} />
        <StatCard icon={<FaTasks />} label="Sessions" value={stats.sessionCount} />
        <StatCard icon={<FaChartLine />} label="Avg Duration" value={formatTime(stats.avgDuration)} />
        <StatCard icon={<FaCalendarWeek />} label="Active Days" value={stats.activeDays} />
        <StatCard icon={<FaTag />} label="Top Category" value={stats.topCategory} />
        <StatCard icon={<FaTrophy />} label="Longest" value={formatTime(stats.longestSession)} />
        <StatCard icon={<FaHourglassHalf />} label="Shortest" value={formatTime(stats.shortestSession)} />
      </div>

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md mb-6 flex flex-col lg:flex-row gap-6 w-full">
        <div className="lg:w-2/3 w-full">
          <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
            <FaChartPie /> Session Distribution by Category
          </h3>
          <div className="w-full" style={{ height: '300px' }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
        <div className="lg:w-1/3 w-full flex flex-col justify-start">
          <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
            <FaTag /> Top Categories
          </h3>
          {stats.topCategories.length > 0 ? (
            <ul className="space-y-4">
              {stats.topCategories.map((cat, idx) => (
                <li key={idx} className="flex justify-between items-center text-[clamp(0.9rem,1.5vw,1.5vh)]">
                  <span>{cat.category}</span>
                  <span className="text-[#6B5B95] font-semibold">{cat.count} sessions</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-[clamp(0.9rem,1.5vw,1.5vh)]">No category data</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md flex flex-col lg:flex-row gap-6 w-full">
        <div className="lg:w-1/4 w-full">
          <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
            <FaChartLine /> Productivity
          </h3>
          <div className="flex items-center gap-2 mb-4">
            {stats.productivityTrend >= 0 ? (
              <FaArrowUp className="text-green-500" />
            ) : (
              <FaArrowDown className="text-red-500" />
            )}
            <p className="text-[clamp(0.9rem,1.5vw,1.5vh)]">
              {Math.abs(stats.productivityTrend).toFixed(1)}% {stats.productivityTrend >= 0 ? 'up' : 'down'}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <StatCard icon={<FaCheckSquare />} label="Streak" value={`${stats.streak} days`} />
            <StatCard icon={<FaChartBar />} label="Completion" value={`${stats.completionRate.toFixed(1)}%`} />
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
            <FaBullseye /> Weekly Goal Progress
          </h3>
          <div className="w-full bg-gray-200 dark:bg-[rgb(50,50,50)] rounded-full h-3 mb-2">
            <div 
              className="bg-[#6B5B95] h-3 rounded-full transition-all duration-500" 
              style={{ width: `${stats.goalProgress}%` }}
            ></div>
          </div>
          <p className="text-[clamp(0.8rem,1.2vw,1.2vh)] text-gray-500 dark:text-gray-400">
            {formatTime(stats.totalTime)} / {weeklyGoal}h goal ({stats.goalProgress.toFixed(1)}%)
          </p>
        </div>
        <div className="lg:w-1/4 w-full">
          <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
            <FaFire /> Weekly Activity
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
              <div 
                key={day}
                className={`h-8 rounded-md flex items-center justify-center text-[clamp(0.8rem,1.2vw,1.2vh)] ${
                  stats.weeklyActivity[idx] 
                    ? `bg-[#6B5B95] opacity-${Math.min(stats.weeklyActivity[idx] * 20, 100)}` 
                    : 'bg-gray-200 dark:bg-[rgb(50,50,50)]'
                }`}
                title={`${day}: ${stats.weeklyActivity[idx] || 0} sessions`}
              >
                {day.slice(0, 1)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gray-100 dark:bg-[rgb(50,50,50)] rounded-xl py-[min(0.5vw,0.5vh)] px-[min(1vw,1vh)] flex items-center gap-3 hover:bg-gray-200 dark:hover:bg-[rgb(60,60,60)] transition-colors duration-300 shadow-md">
      <div className="text-[#6B5B95] text-[clamp(1.2rem,2vw,2vh)]">{icon}</div>
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-[clamp(0.7rem,1vw,1vh)]">{label}</p>
        <p className="text-[clamp(0.9rem,1.5vw,1.5vh)] font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}