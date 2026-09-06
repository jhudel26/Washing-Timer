'use client';

import { useState, useEffect, useCallback } from 'react';
import { washingPrograms, getProgramById } from '@/data/programs';
import { TimerData, TimerState } from '@/types/programs';
import { 
  saveTimerData, 
  loadTimerData, 
  clearTimerData, 
  calculateRemainingTime,
  calculateCurrentStage,
  createTimerData,
  pauseTimer,
  resumeTimer,
  cancelTimer,
  checkTimerCompletion,
} from '@/utils/timer';
import { saveHistoryEntry } from '@/utils/history';
import { soundManager, hapticFeedback } from '@/utils/sound';
import ProgramKnob from '@/components/ProgramKnob';
import WashingDrum from '@/components/WashingDrum';
import TimerDisplay from '@/components/TimerDisplay';
import ControlButtons from '@/components/ControlButtons';
import CycleProgress from '@/components/CycleProgress';
import CustomTimerDialog from '@/components/CustomTimerDialog';
import Link from 'next/link';

export default function Home() {
  const [selectedProgram, setSelectedProgram] = useState(washingPrograms[0]);
  const [timerData, setTimerData] = useState<TimerData | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customTimerLabel, setCustomTimerLabel] = useState('Custom Wash');
  const [customDuration, setCustomDuration] = useState(30); // minutes
  const [isCustomTimer, setIsCustomTimer] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Load sound and haptic settings
  useEffect(() => {
    const soundSetting = localStorage.getItem('sound-enabled');
    const hapticSetting = localStorage.getItem('haptic-enabled');
    const settingsData = localStorage.getItem('washing-settings');
    
    if (soundSetting !== null) {
      setSoundEnabled(soundSetting === 'true');
      soundManager.setEnabled(soundSetting === 'true');
    }
    
    if (hapticSetting !== null) {
      setHapticEnabled(hapticSetting === 'true');
    }
    
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      setDarkMode(settings.darkMode ?? true);
      
      // Apply dark mode
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Load timer data on mount
  useEffect(() => {
    const savedData = loadTimerData();
    if (savedData) {
      setTimerData(savedData);
      
      // Check if it's a custom timer
      if (savedData.programId === 'custom') {
        setIsCustomTimer(true);
        const customProgram = {
          ...washingPrograms[0],
          id: 'custom',
          name: 'Custom',
          duration: Math.floor((savedData.endTime - savedData.startTime) / (60 * 1000)),
          stages: [{ name: 'Custom', duration: Math.floor((savedData.endTime - savedData.startTime) / (60 * 1000)) }],
        };
        setSelectedProgram(customProgram);
      } else {
        const program = getProgramById(savedData.programId);
        if (program) {
          setSelectedProgram(program);
        }
      }
      
      // Check if timer has completed while app was closed
      if (checkTimerCompletion(savedData)) {
        const completedData = { ...savedData, state: 'finished' as TimerState };
        setTimerData(completedData);
        saveTimerData(completedData);
        
        // Save to history
        const program = getProgramById(savedData.programId);
        if (program) {
          saveHistoryEntry({
            id: Date.now().toString(),
            programId: program.id,
            programName: program.name,
            duration: program.duration,
            completedAt: savedData.endTime,
          });
        } else if (savedData.programId === 'custom') {
          // Handle custom timer history
          const duration = Math.floor((savedData.endTime - savedData.startTime) / (60 * 1000));
          saveHistoryEntry({
            id: Date.now().toString(),
            programId: 'custom',
            programName: 'Custom',
            duration: duration,
            completedAt: savedData.endTime,
          });
        }
        
        clearTimerData();
      }
    }
  }, []);

  // Update remaining time every second
  useEffect(() => {
    if (!timerData || timerData.state === 'finished') return;

    const interval = setInterval(() => {
      if (timerData.state === 'running') {
        const remaining = calculateRemainingTime(timerData);
        setRemainingTime(remaining);
        
        const { stageIndex } = calculateCurrentStage(timerData);
        setCurrentStageIndex(stageIndex);

        // Check for completion
        if (remaining <= 0) {
          const completedData = { ...timerData, state: 'finished' as TimerState };
          setTimerData(completedData);
          saveTimerData(completedData);
          
          // Save to history
          const program = getProgramById(timerData.programId);
          if (program) {
            saveHistoryEntry({
              id: Date.now().toString(),
              programId: program.id,
              programName: program.name,
              duration: program.duration,
              completedAt: timerData.endTime,
            });
          }
          
          clearTimerData();
          
          // Send notification
          sendNotification(program?.name || 'Wash cycle');
          
          // Sound and haptic feedback for completion
          if (soundEnabled) {
            soundManager.playComplete();
          }
          if (hapticEnabled) {
            hapticFeedback.success();
          }
        }
      }
    }, 1000, [timerData, soundEnabled, hapticEnabled]);

    return () => clearInterval(interval);
  }, [timerData, soundEnabled, hapticEnabled]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (programName: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Washing Complete', {
        body: `Your ${programName} cycle has finished.`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
    }
  };

  const handleStart = useCallback(() => {
    const newTimerData = createTimerData(selectedProgram.id, selectedProgram.duration);
    setTimerData(newTimerData);
    saveTimerData(newTimerData);
    setRemainingTime(selectedProgram.duration * 60 * 1000);
    setCurrentStageIndex(0);
    
    // Sound and haptic feedback
    if (soundEnabled) {
      soundManager.playStart();
    }
    if (hapticEnabled) {
      hapticFeedback.success();
    }
  }, [selectedProgram, soundEnabled, hapticEnabled]);

  const handlePause = useCallback(() => {
    if (!timerData) return;
    const pausedData = pauseTimer(timerData);
    setTimerData(pausedData);
    saveTimerData(pausedData);
    
    if (soundEnabled) {
      soundManager.playPause();
    }
    if (hapticEnabled) {
      hapticFeedback.medium();
    }
  }, [timerData, soundEnabled, hapticEnabled]);

  const handleResume = useCallback(() => {
    if (!timerData) return;
    const resumedData = resumeTimer(timerData);
    setTimerData(resumedData);
    saveTimerData(resumedData);
    
    if (soundEnabled) {
      soundManager.playStart();
    }
    if (hapticEnabled) {
      hapticFeedback.medium();
    }
  }, [timerData, soundEnabled, hapticEnabled]);

  const handleCancel = useCallback(() => {
    cancelTimer();
    setTimerData(null);
    setRemainingTime(0);
    setCurrentStageIndex(0);
    
    if (soundEnabled) {
      soundManager.playCancel();
    }
    if (hapticEnabled) {
      hapticFeedback.error();
    }
  }, [soundEnabled, hapticEnabled]);

  const handleCustomTimer = useCallback((hours: number, minutes: number, label: string) => {
    const totalMinutes = hours * 60 + minutes;
    setCustomDuration(totalMinutes);
    setCustomTimerLabel(label);
    setIsCustomTimer(true);
    
    // Create a custom program
    const customProgram = {
      ...selectedProgram,
      id: 'custom',
      name: label,
      duration: totalMinutes,
      stages: [{ name: 'Custom', duration: totalMinutes }],
    };
    
    setSelectedProgram(customProgram);
    const newTimerData = createTimerData('custom', totalMinutes);
    setTimerData(newTimerData);
    saveTimerData(newTimerData);
    setRemainingTime(totalMinutes * 60 * 1000);
    setCurrentStageIndex(0);
    
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  }, [selectedProgram]);

  const getDrumState = () => {
    if (!timerData) return 'idle';
    if (timerData.state === 'paused') return 'paused';
    if (timerData.state === 'finished') return 'finished';
    
    const program = getProgramById(timerData.programId);
    if (!program) return 'idle';
    
    const currentStage = program.stages[currentStageIndex];
    if (!currentStage) return 'idle';
    
    switch (currentStage.name.toLowerCase()) {
      case 'wash':
        return 'washing';
      case 'rinse':
        return 'rinsing';
      case 'spin':
        return 'spinning';
      case 'cleaning':
        return 'washing';
      default:
        return 'washing';
    }
  };

  const drumState = getDrumState();
  const program = timerData ? getProgramById(timerData.programId) : selectedProgram;
  const overallProgress = timerData && program 
    ? ((program.duration * 60 * 1000 - remainingTime) / (program.duration * 60 * 1000)) * 100
    : 0;

  return (
    <main id="main-content" className={`min-h-screen bg-gradient-to-b ${darkMode ? 'from-gray-950 via-gray-900 to-gray-950' : 'from-gray-100 via-gray-50 to-gray-100'} ${darkMode ? 'text-white' : 'text-gray-900'} safe-area-bottom`} tabIndex={-1}>
      <div className="container mx-auto px-4 py-4 pt-6 pb-8 max-w-2xl min-h-screen flex flex-col justify-center">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-wider text-gray-300">
            WASHING MACHINE
          </h1>
          <div className="flex items-center gap-3">
            <Link 
              href="/history"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="View history"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
            <Link 
              href="/settings"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </header>
        
        {/* Offline indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">OFFLINE READY</span>
        </div>

        {/* Program selection knob */}
        {!timerData && (
          <div className="mb-8">
            <ProgramKnob
              programs={washingPrograms}
              selectedProgram={selectedProgram}
              onProgramSelect={setSelectedProgram}
              soundEnabled={soundEnabled}
              hapticEnabled={hapticEnabled}
            />
            
            {/* Custom timer button */}
            <div className="text-center mt-4">
              <button
                onClick={() => setShowCustomDialog(true)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors"
              >
                ⏱️ Custom Timer
              </button>
            </div>
          </div>
        )}

        {/* Program info */}
        {program && (
          <div className="text-center mb-6 space-y-1">
            <div className="text-3xl mb-2">{program.icon}</div>
            <h2 className="text-xl font-bold text-white">{program.name}</h2>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>{program.temperature}°C</span>
              <span>•</span>
              <span>{program.spinSpeed} RPM</span>
              <span>•</span>
              <span>{Math.floor(program.duration / 60)}h {program.duration % 60}m</span>
            </div>
          </div>
        )}

        {/* Washing drum */}
        <div className="mb-8">
          <WashingDrum
            state={drumState}
            spinSpeed={program?.spinSpeed || 0}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Timer display */}
        {timerData && (
          <div className="mb-8">
            <TimerDisplay
              remainingTime={remainingTime}
              endTime={timerData.endTime}
              state={timerData.state}
            />
          </div>
        )}

        {/* Control buttons */}
        <div className="mb-8">
          <ControlButtons
            state={timerData?.state || 'ready'}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            disabled={false}
          />
        </div>

        {/* Cycle progress */}
        {timerData && timerData.state !== 'finished' && program && (
          <div className="mb-8">
            <CycleProgress
              stages={program.stages}
              currentStageIndex={currentStageIndex}
              overallProgress={overallProgress}
            />
          </div>
        )}

        {/* Finished message */}
        {timerData?.state === 'finished' && (
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-2xl font-bold text-green-400">WASH COMPLETE</h3>
            <p className="text-gray-400">Your laundry is ready.</p>
          </div>
        )}

        {/* Custom timer dialog */}
        <CustomTimerDialog
          isOpen={showCustomDialog}
          onClose={() => setShowCustomDialog(false)}
          onConfirm={handleCustomTimer}
        />
      </div>
    </main>
  );
}