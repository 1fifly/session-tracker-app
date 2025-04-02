import React, { useEffect, useState } from 'react';
import { FaFileImport, FaFileExport, FaBell, FaVolumeUp, FaClock, FaSave, FaFolder, FaCheckSquare, FaUndo } from 'react-icons/fa';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [sessionEndSound, setSessionEndSound] = useState('default');
  const [weeklyGoal, setWeeklyGoal] = useState(20);
  const [defaultCategory, setDefaultCategory] = useState('');
  const [defaultSessionEndRule, setDefaultSessionEndRule] = useState('manual');
  const [importStatus, setImportStatus] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    window.electronAPI.loadSettings().then(settings => {
      setNotifications(settings.notifications ?? true);
      setSessionEndSound(settings.sessionEndSound ?? 'default');
      setWeeklyGoal(settings.weeklyGoal ?? 20);
      setDefaultCategory(settings.defaultCategory ?? '');
      setDefaultSessionEndRule(settings.defaultSessionEndRule ?? 'manual');
      setOriginalSettings({
        notifications: settings.notifications ?? true,
        sessionEndSound: settings.sessionEndSound ?? 'default',
        weeklyGoal: settings.weeklyGoal ?? 20,
        defaultCategory: settings.defaultCategory ?? '',
        defaultSessionEndRule: settings.defaultSessionEndRule ?? 'manual',
      });
    });
  }, []);

  const handleSettingChange = (setter, value) => {
    setter(value);
    setIsDirty(true);
  };

  const handleSave = () => {
    window.electronAPI.saveSettings({
      notifications,
      sessionEndSound,
      weeklyGoal,
      defaultCategory,
      defaultSessionEndRule
    }).then(() => {
      setOriginalSettings({
        notifications,
        sessionEndSound,
        weeklyGoal,
        defaultCategory,
        defaultSessionEndRule
      });
      setIsDirty(false);
      setSaveStatus('Settings saved successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    }).catch(() => {
      setSaveStatus('Error saving settings');
      setTimeout(() => setSaveStatus(''), 3000);
    });
  };

  const handleResetToDefault = () => {
    const defaultSettings = {
      notifications: true,
      sessionEndSound: 'default',
      weeklyGoal: 20,
      defaultCategory: '',
      defaultSessionEndRule: 'manual'
    };
    setNotifications(defaultSettings.notifications);
    setSessionEndSound(defaultSettings.sessionEndSound);
    setWeeklyGoal(defaultSettings.weeklyGoal);
    setDefaultCategory(defaultSettings.defaultCategory);
    setDefaultSessionEndRule(defaultSettings.defaultSessionEndRule);
    setIsDirty(true);
    setSaveStatus('Settings reset to default. Click Save to apply.');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleImport = () => {
    window.electronAPI.importSessions().then(result => {
      setImportStatus(result.success ? 'Sessions imported successfully' : 'Error importing sessions');
      setTimeout(() => setImportStatus(''), 3000);
    });
  };

  const handleExport = () => {
    window.electronAPI.exportSessions().then(result => {
      setExportStatus(result.success ? 'Sessions exported successfully' : 'Error exporting sessions');
      setTimeout(() => setExportStatus(''), 3000);
    });
  };

  return (
    <div className="flex-1 p-6 text-gray-900 dark:text-white overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white shadow-md transition-all duration-300 ${
            isDirty ? 'bg-[#6B5B95] hover:bg-[#584A7A] hover:scale-105' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <FaSave /> Save Settings
        </button>
      </div>

      {saveStatus && <p className="mb-4 text-[clamp(0.9rem,1.5vw,1.5vh)] text-green-500">{saveStatus}</p>}

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md mb-6">
        <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
          <FaFileImport /> Import/Export Sessions
        </h3>
        <div className="flex gap-4">
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-[#6B5B95] text-white rounded-lg font-semibold shadow-md transition-all duration-300 hover:bg-[#584A7A] hover:scale-105"
          >
            Import Sessions
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#6B5B95] text-white rounded-lg font-semibold shadow-md transition-all duration-300 hover:bg-[#584A7A] hover:scale-105"
          >
            Export Sessions
          </button>
        </div>
        {importStatus && <p className="mt-2 text-[clamp(0.9rem,1.5vw,1.5vh)] text-green-500">{importStatus}</p>}
        {exportStatus && <p className="mt-2 text-[clamp(0.9rem,1.5vw,1.5vh)] text-green-500">{exportStatus}</p>}
      </div>

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md mb-6">
        <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
          <FaBell /> Notifications
        </h3>
        <label className="flex items-center gap-2 text-[clamp(0.9rem,1.5vw,1.5vh)]">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => handleSettingChange(setNotifications, e.target.checked)}
            className="w-5 h-5 rounded-md border-gray-300 dark:border-[rgb(50,50,50)] focus:ring-[#6B5B95]"
          />
          Enable Notifications
        </label>
      </div>

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md mb-6">
        <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
          <FaVolumeUp /> Session End Sound
        </h3>
        <select
          value={sessionEndSound}
          onChange={(e) => handleSettingChange(setSessionEndSound, e.target.value)}
          className="w-full p-2 bg-white dark:bg-[rgb(50,50,50)] rounded-lg border-2 border-gray-300 dark:border-[rgb(50,50,50)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6B5B95] text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md"
        >
          <option value="beep">Beep</option>
          <option value="chime">Chime</option>
          <option value="none">None</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md mb-6">
        <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
          <FaClock /> Weekly Goal (Hours)
        </h3>
        <input
          type="number"
          value={weeklyGoal}
          onChange={(e) => handleSettingChange(setWeeklyGoal, Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
          className="w-20 p-2 bg-white dark:bg-[rgb(50,50,50)] rounded-lg border-2 border-gray-300 dark:border-[rgb(50,50,50)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6B5B95] text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md"
        />
      </div>

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md mb-6">
        <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
          <FaFolder /> Default Session Category
        </h3>
        <input
          type="text"
          value={defaultCategory}
          onChange={(e) => handleSettingChange(setDefaultCategory, e.target.value)}
          placeholder="e.g., Work, Study, Exercise"
          className="w-full p-2 bg-white dark:bg-[rgb(50,50,50)] rounded-lg border-2 border-gray-300 dark:border-[rgb(50,50,50)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6B5B95] text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md"
        />
      </div>

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md mb-6">
        <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
          <FaCheckSquare /> Default Session End Rule
        </h3>
        <select
          value={defaultSessionEndRule}
          onChange={(e) => handleSettingChange(setDefaultSessionEndRule, e.target.value)}
          className="w-full p-2 bg-white dark:bg-[rgb(50,50,50)] rounded-lg border-2 border-gray-300 dark:border-[rgb(50,50,50)] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#6B5B95] text-[clamp(0.9rem,1.5vw,1.5vh)] shadow-md"
        >
          <option value="manual">Manual</option>
          <option value="timer">Timer</option>
          <option value="todo">To-Do</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-xl p-4 shadow-md">
        <h3 className="text-[clamp(1rem,2vw,2vh)] font-semibold mb-3 flex items-center gap-2">
          <FaUndo /> Reset Settings
        </h3>
        <button
          onClick={handleResetToDefault}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold shadow-md transition-all duration-300 hover:bg-red-700 hover:scale-105"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}