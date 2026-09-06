'use client';

import { useEffect, useState } from 'react';
import { formatTime, getCompletionTime } from '@/utils/timer';

interface TimerDisplayProps {
  remainingTime: number;
  endTime: number;
  state: 'ready' | 'running' | 'paused' | 'finished';
}

export default function TimerDisplay({ 
  remainingTime, 
  endTime, 
  state 
}: TimerDisplayProps) {
  const [displayTime, setDisplayTime] = useState(remainingTime);

  useEffect(() => {
    setDisplayTime(remainingTime);
  }, [remainingTime]);

  const formattedTime = formatTime(displayTime);
  const completionTime = getCompletionTime(endTime);

  return (
    <div className="text-center space-y-2">
      {/* Status */}
      <div className="text-sm font-medium tracking-wider">
        {state === 'ready' && (
          <span className="text-gray-400">READY</span>
        )}
        {state === 'running' && (
          <span className="text-green-400 animate-pulse">RUNNING</span>
        )}
        {state === 'paused' && (
          <span className="text-yellow-400">PAUSED</span>
        )}
        {state === 'finished' && (
          <span className="text-cyan-400">FINISHED</span>
        )}
      </div>

      {/* Large timer display */}
      <div className="relative">
        <div className="text-6xl font-bold font-mono tracking-tight text-white">
          {formattedTime}
        </div>
        
        {/* Subtle glow effect */}
        <div 
          className="absolute inset-0 blur-3xl opacity-20 pointer-events-none"
          style={{
            background: state === 'running' 
              ? 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)'
              : state === 'paused'
                ? 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%)'
                : state === 'finished'
                  ? 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)'
                  : 'transparent',
          }}
        />
      </div>

      {/* Remaining label */}
      <div className="text-xs text-gray-500 uppercase tracking-widest">
        Remaining
      </div>

      {/* Completion time */}
      {(state === 'running' || state === 'paused') && (
        <div className="text-sm text-gray-400">
          Finishes at {completionTime}
        </div>
      )}

      {/* Finished message */}
      {state === 'finished' && (
        <div className="text-sm text-green-400 font-medium">
          Cycle completed at {completionTime}
        </div>
      )}
    </div>
  );
}