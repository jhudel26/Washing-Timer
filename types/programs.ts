export interface CycleStage {
  name: string;
  duration: number; // in minutes
}

export interface WashingProgram {
  id: string;
  name: string;
  icon: string;
  duration: number; // total duration in minutes
  temperature: number; // in Celsius
  spinSpeed: number; // in RPM
  description: string;
  stages: CycleStage[];
}

export type TimerState = 'ready' | 'running' | 'paused' | 'finished';

export interface TimerData {
  programId: string;
  startTime: number;
  endTime: number;
  paused: boolean;
  pauseStartedAt: number | null;
  totalPausedTime: number;
  currentStageIndex: number;
  state: TimerState;
}