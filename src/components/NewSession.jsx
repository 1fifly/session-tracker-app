import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlay, FaStop, FaPen, FaAlignLeft, FaStickyNote, FaFolder, FaTag, FaCheckSquare, FaEdit } from "react-icons/fa";
import Clock from './Clock.jsx';
import SessionView from './SessionView.jsx';

export default function NewSession() {
  const [notifications, setNotifications] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [todos, setTodos] = useState([{ id: Date.now(), text: '', completed: false, isEditing: false }]);
  const [sessionEndRule, setSessionEndRule] = useState('manual');
  const [timeLimit, setTimeLimit] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [remainingTime, setRemainingTime] = useState(null);
  const [draggedTodo, setDraggedTodo] = useState(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [sessionEndSound, setSessionEndSound] = useState('default');

  useEffect(() => {
    window.electronAPI.loadSettings().then(settings => {
      setNotifications(settings.notifications);
      setSessionEndSound(settings.sessionEndSound);
    });
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && sessionEndRule === 'timer' && (timeLimit.hours > 0 || timeLimit.minutes > 0 || timeLimit.seconds > 0)) {
      const totalSeconds = (timeLimit.hours * 3600 + timeLimit.minutes * 60 + timeLimit.seconds) * 1000;
      setRemainingTime(totalSeconds);

      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1000) {
            clearInterval(interval);
            handleSessionEnd();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, sessionEndRule, timeLimit]);

  useEffect(() => {
    checkTodosComplete();
  }, [todos, isRunning, sessionEndRule]);

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(Date.now());
  };

  const formatTimeToHHMMSS = (elapsedTime) => {
    const hours = Math.floor(elapsedTime / 3600000);
    const minutes = Math.floor((elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleSessionEnd = () => {
    setIsRunning(false);
    const todosString = JSON.stringify(todos);
    const elapsedTime = Date.now() - startTime;
    const length = formatTimeToHHMMSS(elapsedTime);

    const newSession = {
      title,
      description,
      category: category.trim() === '' ? 'Uncategorized' : category,
      tags,
      notes,
      length,
      todos: todosString,
      timestamp: new Date().toISOString()
    };

    setSessionData(newSession);
    setShowEndConfirmation(true);


    if (sessionEndRule === 'timer' && sessionEndSound !== 'none') {
      const audio = new Audio('');
      audio.play();
    }

    if (notifications) {
      new Notification('Session Ended', { body: `${title || 'Unnamed Session'} has ended.` });
    }
  };

  const handleConfirmEnd = async (updatedSessionData) => {
    try {
      await window.electronAPI.saveSession(updatedSessionData);
      setShowEndConfirmation(false);
      setStartTime(null);
      setTodos([{ id: Date.now(), text: '', completed: false, isEditing: false }]);
      setSessionData(null);
      setTitle('');
      setDescription('');
      setNotes('');
      setCategory('');
      setTags('');
    } catch (err) {
      console.error('Error saving session:', err);
    }
  };

  const addTodo = () => {
    setTodos([...todos, { id: Date.now(), text: '', completed: false, isEditing: true }]);
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const updateTodoText = (id, text) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, text } : todo)));
  };

  const finishEditing = (id) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, isEditing: false } : todo)));
  };

  const toggleTodoCompleted = (id) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const toggleTodoEdit = (id) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo)));
  };

  const checkTodosComplete = () => {
    if (isRunning && sessionEndRule === 'todo' && todos.length > 0 && todos.every(todo => todo.completed)) {
      handleSessionEnd();
    }
  };

  const handleTimeLimitChange = (field) => (e) => {
    const value = parseInt(e.target.value) || 0;
    setTimeLimit({
      ...timeLimit,
      [field]: field === 'hours' ? Math.max(23, value) : Math.max(0, Math.min(59, value))
    });
  };

  const formatRemainingTime = () => {
    if (!remainingTime) return '';
    const hours = Math.floor(remainingTime / 3600000);
    const minutes = Math.floor((remainingTime % 3600000) / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleDragStart = (e, todo) => {
    setDraggedTodo(todo);
    e.dataTransfer.setData('text/plain', todo.id);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTodo(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetTodo) => {
    e.preventDefault();
    if (!draggedTodo || draggedTodo.id === targetTodo.id) return;

    const newTodos = todos.filter(todo => todo.id !== draggedTodo.id);
    const targetIndex = todos.findIndex(todo => todo.id === targetTodo.id);
    newTodos.splice(targetIndex, 0, draggedTodo);
    setTodos(newTodos);
  };

  return (
    <div className="w-full h-full flex justify-center items-center absolute">
      {showEndConfirmation && (
        <SessionView
          session={sessionData}
          onClose={() => setShowEndConfirmation(false)}
          onConfirm={handleConfirmEnd}
        />
      )}
      <div className="h-full w-1/4 border-r-2 border-gray-300 dark:border-[rgb(50,50,50)] text-gray-900 dark:text-white py-16 px-4 shadow-2xl shadow-black/30 mt-8">
        <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] mb-4 flex items-center gap-2">
          <FaStickyNote className="text-gray-500" /> Notes
        </h4>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-2/5 resize-none bg-white dark:bg-[rgb(40,40,40)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-4 py-3 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300"
          placeholder="Meeting summary, study progress..."
        ></textarea>
        <div className="flex justify-between items-center mb-4 mt-4">
          <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] flex items-center gap-2">
            <FaCheckSquare className="text-gray-500" /> To-Do
          </h4>
          <button
            onClick={addTodo}
            className="text-[#6B5B95] hover:text-[#584A7A] dark:hover:text-[#584A7A] transition-colors duration-300 font-semibold text-[clamp(0.9rem,1.5vw,1.5vh)]"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2 max-h-[40vh] overflow-y-auto">
          {todos.map(todo => (
            <div
              key={todo.id}
              draggable={!todo.isEditing}
              onDragStart={(e) => !todo.isEditing && handleDragStart(e, todo)}
              onDragEnd={(e) => !todo.isEditing && handleDragEnd(e)}
              onDragOver={(e) => !todo.isEditing && handleDragOver(e)}
              onDrop={(e) => !todo.isEditing && handleDrop(e, todo)}
              className={`flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-[rgb(40,40,40)] shadow-md transition-all duration-300 hover:bg-gray-100 dark:hover:bg-[rgb(50,50,50)] ${todo.isEditing ? 'cursor-text' : 'cursor-move'}`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer ${todo.completed ? 'bg-[#6B5B95]' : 'border-2 border-gray-500'}`}
                onClick={() => toggleTodoCompleted(todo.id)}
              >
                {todo.completed && <span className="text-white text-xs">✓</span>}
              </div>
              {todo.isEditing ? (
                <input
                  type="text"
                  value={todo.text}
                  onChange={(e) => updateTodoText(todo.id, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && finishEditing(todo.id)}
                  onBlur={() => finishEditing(todo.id)}
                  autoFocus
                  className="flex-1 bg-gray-100 dark:bg-[rgb(50,50,50)] outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-2 py-1 rounded text-[clamp(0.9rem,1.5vw,1.5vh)]"
                />
              ) : (
                <span
                  className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'} text-[clamp(0.9rem,1.5vw,1.5vh)]`}
                  onDoubleClick={() => toggleTodoEdit(todo.id)}
                >
                  {todo.text || 'Enter task...'}
                </span>
              )}
              <FaEdit
                className="text-[#6B5B95] cursor-pointer hover:text-[#584A7A] dark:hover:text-[#584A7A] text-[clamp(0.9rem,1.5vw,1.5vh)]"
                onClick={() => toggleTodoEdit(todo.id)}
              />
              <FaTrash
                className="text-red-500 cursor-pointer hover:text-red-400 text-[clamp(0.9rem,1.5vw,1.5vh)]"
                onClick={() => deleteTodo(todo.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="h-full w-2/4 flex justify-center items-center flex-col">
        <Clock isRunning={isRunning} />
        {sessionEndRule === 'timer' && isRunning && remainingTime !== null && (
          <div className="text-gray-900 dark:text-white text-[clamp(1rem,2vw,2vh)] mt-4">
            Remaining: {formatRemainingTime()}
          </div>
        )}
        {isRunning ? (
          <button
            onClick={handleSessionEnd}
            className="w-[min(20vw,20vh)] h-[min(8vw,8vh)] bg-red-600 flex justify-center items-center gap-2 rounded-lg mt-[min(5vw,5vh)] text-[min(4vw,4vh)] font-semibold text-white shadow-md transition-all duration-300 hover:bg-red-700 hover:scale-105"
          >
            <FaStop /> STOP
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-[min(20vw,20vh)] h-[min(8vw,8vh)] bg-[#6B5B95] flex justify-center items-center gap-2 rounded-lg mt-[min(5vw,5vh)] text-[min(4vw,4vh)] font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#584A7A] hover:scale-105"
          >
            <FaPlay /> START
          </button>
        )}
      </div>

      <div className="h-full w-1/4 border-l-2 border-gray-300 dark:border-[rgb(50,50,50)] text-gray-900 dark:text-white py-16 px-4 overflow-y-auto shadow-2xl shadow-black/30 mt-8">
        <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] mb-4 flex items-center gap-2">
          <FaPen className="text-gray-500" /> Title
        </h4>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          className="w-full h-10 bg-white dark:bg-[rgb(40,40,40)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-4 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300"
          placeholder="Study Session..."
        />
        <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] mt-4 mb-4 flex items-center gap-2">
          <FaAlignLeft className="text-gray-500" /> Description
        </h4>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-[min(15vw,15vh)] bg-white dark:bg-[rgb(40,40,40)] resize-none rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-4 py-3 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300"
          placeholder="Focus on React components, write report..."
        ></textarea>
        <div className="flex gap-x-6 flex-col lg:flex-row overflow-visible">
          <div className="overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] mt-4 mb-4 flex items-center gap-2">
              <FaFolder className="text-gray-500" /> Category
            </h4>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              type="text"
              className="w-full h-10 bg-white dark:bg-[rgb(40,40,40)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-4 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300"
              placeholder="Work, Study, Exercise..."
            />
          </div>
          <div className="overflow-visible">
            <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] mt-4 mb-4 flex items-center gap-2">
              <FaTag className="text-gray-500" /> Tags
            </h4>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              type="text"
              className="w-full h-10 bg-white dark:bg-[rgb(40,40,40)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white px-4 placeholder-gray-500 text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300"
              placeholder="JavaScript, Project A..."
            />
          </div>
        </div>
        <h4 className="text-[clamp(1rem,1.5vw,1.5vh)] font-bold tracking-wide uppercase relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-12 after:h-[2px] after:bg-[#6B5B95] mt-4 mb-4 flex items-center gap-2">
          <FaCheckSquare className="text-gray-500" /> Session End Rule
        </h4>
        <div className="flex gap-2">
          {['manual', 'timer', 'todo'].map(range => (
            <button
              key={range}
              onClick={() => setSessionEndRule(range)}
              className={`px-[4%] py-2 rounded-lg text-[clamp(0.9rem,1.5vw,1.5vh)] font-medium shadow-md transition-all duration-300 hover:scale-105 ${
                sessionEndRule === range 
                  ? 'bg-[#6B5B95] text-white' 
                  : 'bg-white dark:bg-[rgb(40,40,40)] text-gray-600 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-[rgb(50,50,50)]'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        {sessionEndRule === 'timer' && (
          <div className="mt-4 flex gap-4 overflow-visible">
            <div className="relative overflow-visible">
              <input
                type="number"
                value={timeLimit.hours}
                onChange={handleTimeLimitChange('hours')}
                className="w-14 h-12 bg-white dark:bg-[rgb(40,40,40)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white text-center text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300"
                min="0"
              />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-1 text-xs text-gray-500">HR</span>
            </div>
            <div className="relative overflow-visible">
              <input
                type="number"
                value={timeLimit.minutes}
                onChange={handleTimeLimitChange('minutes')}
                className="w-14 h-12 bg-white dark:bg-[rgb(40,40,40)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white text-center text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300"
                min="0"
                max="59"
              />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-1 text-xs text-gray-500">MIN</span>
            </div>
            <div className="relative overflow-visible">
              <input
                type="number"
                value={timeLimit.seconds}
                onChange={handleTimeLimitChange('seconds')}
                className="w-14 h-12 bg-white dark:bg-[rgb(40,40,40)] rounded-lg border-none outline-none focus:ring-2 focus:ring-[#6B5B95] text-gray-900 dark:text-white text-center text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md transition-all duration-300"
                min="0"
                max="59"
              />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-1 text-xs text-gray-500">SEC</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}