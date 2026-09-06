'use client';

import { useState } from 'react';

interface ControlButtonsProps {
  state: 'ready' | 'running' | 'paused' | 'finished';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function ControlButtons({
  state,
  onStart,
  onPause,
  onResume,
  onCancel,
  disabled = false,
}: ControlButtonsProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelClick = () => {
    if (state === 'running' || state === 'paused') {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleCancelConfirm = (confirmed: boolean) => {
    setShowCancelConfirm(false);
    if (confirmed) {
      onCancel();
    }
  };

  return (
    <div className="flex items-center justify-center gap-6 relative z-20">
      {/* Play/Start Button */}
      {state === 'ready' && (
        <button
          onClick={onStart}
          disabled={disabled}
          className={`
            w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600
            flex items-center justify-center shadow-lg
            hover:from-green-400 hover:to-green-500
            active:scale-95 transition-all duration-150
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="Start washing cycle"
        >
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      )}

      {/* Pause Button */}
      {(state === 'running') && (
        <button
          onClick={onPause}
          disabled={disabled}
          className={`
            w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600
            flex items-center justify-center shadow-lg
            hover:from-yellow-400 hover:to-yellow-500
            active:scale-95 transition-all duration-150
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="Pause washing cycle"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
      )}

      {/* Resume Button */}
      {state === 'paused' && (
        <button
          onClick={onResume}
          disabled={disabled}
          className={`
            w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600
            flex items-center justify-center shadow-lg
            hover:from-green-400 hover:to-green-500
            active:scale-95 transition-all duration-150
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="Resume washing cycle"
        >
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      )}

      {/* Cancel Button */}
      <button
        onClick={handleCancelClick}
        disabled={disabled || state === 'finished'}
        className={`
          w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600
          flex items-center justify-center shadow-lg
          hover:from-red-400 hover:to-red-500
          active:scale-95 transition-all duration-150
          ${disabled || state === 'finished' ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label="Cancel washing cycle"
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z"/>
        </svg>
      </button>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div 
            className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Cancel washing cycle?
            </h3>
            <p className="text-gray-400 mb-6">
              This will stop the current cycle and clear the timer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleCancelConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors"
              >
                Keep Running
              </button>
              <button
                onClick={() => handleCancelConfirm(true)}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
              >
                Cancel Cycle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}