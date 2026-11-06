import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, Sun, Moon, Check, Timer as TimerIcon, Watch, Bell } from 'lucide-react';
import { audioService } from '../services/audioService';
import { vibrationService } from '../services/vibrationService';

export type ActiveTab = 'timer' | 'stopwatch' | 'alarm';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  isFullscreen,
  toggleFullscreen,
  theme,
  toggleTheme,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    vibrationService.tap();
    audioService.playClick();
    setActiveTab(tab);
  };

  const handleMuteToggle = () => {
    vibrationService.tap();
    const newMute = audioService.toggleMute();
    setIsMuted(newMute);
  };

  return (
    <header className="w-full flex items-center justify-between px-2 sm:px-4 py-3 select-none">
      {/* Navigation Pills matching Google Search Timer/Stopwatch */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Timer Tab */}
        <button
          onClick={() => handleTabClick('timer')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'timer'
              ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label="Timer Tab"
        >
          {activeTab === 'timer' ? <Check className="w-4 h-4 stroke-[2.5]" /> : <TimerIcon className="w-4 h-4" />}
          <span>Timer</span>
        </button>

        {/* Stopwatch Tab */}
        <button
          onClick={() => handleTabClick('stopwatch')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'stopwatch'
              ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label="Stopwatch Tab"
        >
          {activeTab === 'stopwatch' ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Watch className="w-4 h-4" />}
          <span>Stopwatch</span>
        </button>

        {/* Alarm Tab */}
        <button
          onClick={() => handleTabClick('alarm')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'alarm'
              ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] shadow-sm font-semibold'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label="Alarm Tab"
        >
          {activeTab === 'alarm' ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Bell className="w-4 h-4" />}
          <span>Alarm</span>
        </button>
      </div>

      {/* Action Utilities: Mute, Theme, Fullscreen */}
      <div className="flex items-center gap-1 sm:gap-2 text-gray-500 dark:text-gray-400">
        {/* Mute Toggle */}
        <button
          onClick={handleMuteToggle}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 hover:text-blue-600 dark:hover:text-blue-400" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 hover:text-blue-600" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Maximize2 className="w-5 h-5 hover:text-blue-600 dark:hover:text-blue-400" />}
        </button>
      </div>
    </header>
  );
};
