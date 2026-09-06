'use client';

import { CycleStage } from '@/types/programs';

interface CycleProgressProps {
  stages: CycleStage[];
  currentStageIndex: number;
  overallProgress: number; // 0-100
}

export default function CycleProgress({ 
  stages, 
  currentStageIndex, 
  overallProgress 
}: CycleProgressProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Overall progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stage timeline */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2" />
        
        {/* Active progress line */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-cyan-500 -translate-y-1/2 transition-all duration-500"
          style={{ 
            width: `${(currentStageIndex / (stages.length - 1)) * 100}%` 
          }}
        />

        {/* Stage indicators */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isUpcoming = index > currentStageIndex;

            return (
              <div key={stage.name} className="flex flex-col items-center gap-2">
                {/* Stage dot */}
                <div 
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted 
                      ? 'bg-cyan-500 border-cyan-500' 
                      : isCurrent 
                        ? 'bg-cyan-500 border-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse'
                        : 'bg-gray-900 border-gray-600'
                    }
                  `}
                >
                  {isCompleted && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </div>

                {/* Stage name */}
                <div 
                  className={`
                    text-xs font-medium transition-colors duration-300
                    ${isCompleted 
                      ? 'text-cyan-400' 
                      : isCurrent 
                        ? 'text-white font-bold'
                        : 'text-gray-500'
                    }
                  `}
                >
                  {stage.name}
                </div>

                {/* Stage duration */}
                <div className="text-xs text-gray-600">
                  {stage.duration}m
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current stage info */}
      {currentStageIndex < stages.length && (
        <div className="text-center">
          <div className="text-sm text-gray-400">
            Current stage: <span className="text-white font-medium">{stages[currentStageIndex].name}</span>
          </div>
          {currentStageIndex < stages.length - 1 && (
            <div className="text-xs text-gray-500 mt-1">
              Next → {stages[currentStageIndex + 1].name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}