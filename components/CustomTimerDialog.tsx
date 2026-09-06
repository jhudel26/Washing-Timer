'use client';

import { useState } from 'react';

interface CustomTimerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hours: number, minutes: number, label: string) => void;
}

export default function CustomTimerDialog({
  isOpen,
  onClose,
  onConfirm,
}: CustomTimerDialogProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [label, setLabel] = useState('Custom Wash');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes > 0) {
      onConfirm(hours, minutes, label);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleQuickSelect = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    setHours(h);
    setMinutes(m);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-700" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Custom Timer
        </h3>

        {/* Time input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Duration</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="text-xs text-gray-500 text-center mt-1">Hours</div>
            </div>
            <div className="text-2xl text-gray-400">:</div>
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="text-xs text-gray-500 text-center mt-1">Minutes</div>
            </div>
          </div>
        </div>

        {/* Quick select buttons */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Quick Select</label>
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60, 90, 120, 150, 180].map((mins) => (
              <button
                key={mins}
                onClick={() => handleQuickSelect(mins)}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
              >
                {mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Label input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Label (optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Custom Wash"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={hours === 0 && minutes === 0}
            className="flex-1 px-4 py-3 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Timer
          </button>
        </div>
      </div>
    </div>
  );
}