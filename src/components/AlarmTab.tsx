import React, { useState } from 'react';
import { Plus, Bell, Trash2, Edit2, Clock } from 'lucide-react';
import { AlarmItem } from '../types';
import { formatAlarmTime, getTimeUntilAlarm } from '../utils/timeFormat';
import { AlarmModal } from './AlarmModal';
import { vibrationService } from '../services/vibrationService';

interface AlarmTabProps {
  alarms: AlarmItem[];
  onToggleAlarm: (id: string) => void;
  onSaveAlarm: (alarm: Omit<AlarmItem, 'id'>, id?: string) => void;
  onDeleteAlarm: (id: string) => void;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const AlarmTab: React.FC<AlarmTabProps> = ({
  alarms,
  onToggleAlarm,
  onSaveAlarm,
  onDeleteAlarm,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<AlarmItem | undefined>(undefined);

  const handleOpenNew = () => {
    vibrationService.tap();
    setEditingAlarm(undefined);
    setModalOpen(true);
  };

  const handleEdit = (alarm: AlarmItem) => {
    vibrationService.tap();
    setEditingAlarm(alarm);
    setModalOpen(true);
  };

  // Find nearest upcoming alarm
  const enabledAlarms = alarms.filter((a) => a.enabled);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Alarms</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {enabledAlarms.length > 0
              ? `${enabledAlarms.length} active ${enabledAlarms.length === 1 ? 'alarm' : 'alarms'}`
              : 'No alarms currently enabled'}
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Alarm</span>
        </button>
      </div>

      {/* Alarms List */}
      {alarms.length === 0 ? (
        <div className="w-full bg-white dark:bg-[#303134] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center">
          <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">No alarms set</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            Create an alarm to wake up on time or remind yourself of recurring daily events.
          </p>
          <button
            onClick={handleOpenNew}
            className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-full transition-colors"
          >
            Create first alarm
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alarms.map((alarm) => {
            const { time12, period } = formatAlarmTime(alarm.time);
            const timeUntil = alarm.enabled ? getTimeUntilAlarm(alarm.time, alarm.daysOfWeek) : '';

            return (
              <div
                key={alarm.id}
                className={`w-full bg-white dark:bg-[#303134] rounded-2xl border transition-all p-5 shadow-xs ${
                  alarm.enabled
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-gray-100 dark:border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Time & Information */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-normal text-gray-900 dark:text-gray-100 tracking-tight font-sans">
                        {time12}
                      </span>
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        {period}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {alarm.label}
                      </span>
                      {timeUntil && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full font-medium">
                          {timeUntil}
                        </span>
                      )}
                    </div>

                    {/* Days of week chips */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {DAY_LABELS.map((dayName, idx) => {
                        const isActive = alarm.daysOfWeek.includes(idx);
                        return (
                          <span
                            key={idx}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isActive && alarm.enabled
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                                : isActive
                                ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                : 'text-gray-400 dark:text-gray-600'
                            }`}
                          >
                            {dayName}
                          </span>
                        );
                      })}
                      {alarm.daysOfWeek.length === 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">Ring once</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Switch & Action buttons */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={alarm.enabled}
                      onClick={() => {
                        vibrationService.tap();
                        onToggleAlarm(alarm.id);
                      }}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        alarm.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Actions: Edit, Delete */}
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => handleEdit(alarm)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Edit Alarm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          vibrationService.tap();
                          onDeleteAlarm(alarm.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete Alarm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alarm Modal */}
      {modalOpen && (
        <AlarmModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialAlarm={editingAlarm}
          onSave={(alarmData) => {
            onSaveAlarm(alarmData, editingAlarm?.id);
          }}
        />
      )}
    </div>
  );
};

