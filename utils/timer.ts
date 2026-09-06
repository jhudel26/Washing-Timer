import { TimerData, TimerState } from '@/types/programs';
import { getProgramById } from '@/data/programs';

const TIMER_STORAGE_KEY = 'washing-timer-data';

export const saveTimerData = (data: TimerData): void => {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save timer data:', error);
  }
};

export const loadTimerData = (): TimerData | null => {
  try {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as TimerData;
    }
  } catch (error) {
    console.error('Failed to load timer data:', error);
  }
  return null;
};

export const clearTimerData = (): void => {
  try {
    localStorage.removeItem(TIMER_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear timer data:', error);
  }
};

export const calculateRemainingTime = (timerData: TimerData): number => {
  const now = Date.now();
  let endTime = timerData.endTime;

  if (timerData.paused && timerData.pauseStartedAt) {
    // If paused, add the pause duration to the end time
    endTime += (now - timerData.pauseStartedAt);
  }

  const remaining = Math.max(0, endTime - now);
  return remaining;
};

export const calculateCurrentStage = (timerData: TimerData): { stageIndex: number; stageProgress: number } => {
  const program = getProgramById(timerData.programId);
  if (!program) return { stageIndex: 0, stageProgress: 0 };

  const totalElapsed = timerData.endTime - timerData.startTime - timerData.totalPausedTime;
  const totalDuration = program.duration * 60 * 1000; // Convert to milliseconds

  let accumulatedTime = 0;
  for (let i = 0; i < program.stages.length; i++) {
    const stageDuration = program.stages[i].duration * 60 * 1000;
    if (totalElapsed < accumulatedTime + stageDuration) {
      const stageElapsed = totalElapsed - accumulatedTime;
      const stageProgress = stageElapsed / stageDuration;
      return { stageIndex: i, stageProgress };
    }
    accumulatedTime += stageDuration;
  }

  return { stageIndex: program.stages.length - 1, stageProgress: 1 };
};

export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
};

export const getCompletionTime = (endTime: number): string => {
  const date = new Date(endTime);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

export const createTimerData = (programId: string, durationMinutes: number): TimerData => {
  const now = Date.now();
  const durationMs = durationMinutes * 60 * 1000;
  
  return {
    programId,
    startTime: now,
    endTime: now + durationMs,
    paused: false,
    pauseStartedAt: null,
    totalPausedTime: 0,
    currentStageIndex: 0,
    state: 'running',
  };
};

export const pauseTimer = (timerData: TimerData): TimerData => {
  return {
    ...timerData,
    paused: true,
    pauseStartedAt: Date.now(),
    state: 'paused',
  };
};

export const resumeTimer = (timerData: TimerData): TimerData => {
  if (!timerData.pauseStartedAt) return timerData;
  
  const pauseDuration = Date.now() - timerData.pauseStartedAt;
  const newEndTime = timerData.endTime + pauseDuration;
  
  return {
    ...timerData,
    paused: false,
    pauseStartedAt: null,
    totalPausedTime: timerData.totalPausedTime + pauseDuration,
    endTime: newEndTime,
    state: 'running',
  };
};

export const cancelTimer = (): void => {
  clearTimerData();
};

export const checkTimerCompletion = (timerData: TimerData): boolean => {
  const remaining = calculateRemainingTime(timerData);
  return remaining <= 0;
};