'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { WashingProgram } from '@/types/programs';
import { soundManager, hapticFeedback } from '@/utils/sound';

interface ProgramKnobProps {
  programs: WashingProgram[];
  selectedProgram: WashingProgram;
  onProgramSelect: (program: WashingProgram) => void;
  disabled?: boolean;
  soundEnabled?: boolean;
  hapticEnabled?: boolean;
}

export default function ProgramKnob({ 
  programs, 
  selectedProgram, 
  onProgramSelect,
  disabled = false,
  soundEnabled = true,
  hapticEnabled = true,
}: ProgramKnobProps) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startRotation, setStartRotation] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIndex = programs.findIndex(p => p.id === selectedProgram.id);
  const anglePerProgram = 360 / programs.length;

  // Update rotation when selected program changes externally
  useEffect(() => {
    if (isDragging) return;
    const targetRotation = selectedIndex * anglePerProgram;
    setRotation((prev) => {
      const remainder = ((prev % 360) + 360) % 360;
      const baseTurns = prev - remainder;
      let candidate = baseTurns + targetRotation;
      const diff = candidate - prev;
      if (diff > 180) candidate -= 360;
      else if (diff < -180) candidate += 360;
      return candidate;
    });
  }, [selectedIndex, anglePerProgram, isDragging]);

  const getAngleFromEvent = useCallback((clientX: number, clientY: number): number => {
    if (!containerRef.current) return 0;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = angle + 90; // Adjust to start from top
    if (angle < 0) angle += 360;
    
    return angle;
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled) return;
    
    setIsDragging(true);
    setStartAngle(getAngleFromEvent(clientX, clientY));
    setStartRotation(rotation);
    
    // Haptic feedback if supported
    if (hapticEnabled) {
      hapticFeedback.light();
    }
  }, [disabled, getAngleFromEvent, rotation, hapticEnabled]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || disabled) return;
    
    const currentAngle = getAngleFromEvent(clientX, clientY);
    let angleDelta = currentAngle - startAngle;
    // Normalize delta to [-180, +180] so crossing the 359°↔0° wrap point
    // (the top of the circle) does not cause a 358° jump the wrong way.
    if (angleDelta > 180) angleDelta -= 360;
    else if (angleDelta < -180) angleDelta += 360;
    const newRotation = startRotation + angleDelta;
    
    setRotation(newRotation);
    
    // Calculate which program is closest to the indicator
    const normalizedRotation = ((newRotation % 360) + 360) % 360;
    const programIndex = Math.round(normalizedRotation / anglePerProgram) % programs.length;
    const targetProgram = programs[programIndex];
    
    if (targetProgram && targetProgram.id !== selectedProgram.id) {
      onProgramSelect(targetProgram);
      
      // Sound and haptic feedback for program change
      if (soundEnabled) {
        soundManager.playDialClick();
      }
      if (hapticEnabled) {
        hapticFeedback.light();
      }
    }
  }, [isDragging, disabled, getAngleFromEvent, startAngle, startRotation, anglePerProgram, programs, selectedProgram, onProgramSelect, soundEnabled, hapticEnabled]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Snap to nearest program, taking the shortest angular path
    const remainder = ((rotation % 360) + 360) % 360;
    const baseTurns = rotation - remainder;
    const programIndex = Math.round(remainder / anglePerProgram) % programs.length;
    let targetRotation = baseTurns + programIndex * anglePerProgram;
    const diff = targetRotation - rotation;
    if (diff > 180) targetRotation -= 360;
    else if (diff < -180) targetRotation += 360;
    
    setRotation(targetRotation);
    
    const targetProgram = programs[programIndex];
    if (targetProgram && targetProgram.id !== selectedProgram.id) {
      onProgramSelect(targetProgram);
      if (soundEnabled) {
        soundManager.playDialClick();
      }
      if (hapticEnabled) {
        hapticFeedback.light();
      }
    }
  }, [isDragging, rotation, anglePerProgram, programs, selectedProgram, onProgramSelect, soundEnabled, hapticEnabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Add global event listeners for drag (mouse + touch)
  // Global touch listeners are critical on mobile: once the finger leaves
  // the knob element the React element handlers stop firing, and without
  // window-level listeners the drag freezes.
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
      };
      
      const handleGlobalMouseUp = () => {
        handleEnd();
      };

      const handleGlobalTouchMove = (e: TouchEvent) => {
        // Cancel scroll/zoom/refresh gestures only while actively dragging
        // so the page scrolls normally when the knob isn't being used.
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        if (touch) handleMove(touch.clientX, touch.clientY);
      };
      
      const handleGlobalTouchEnd = () => {
        handleEnd();
      };
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false, capture: true });
      window.addEventListener('touchend', handleGlobalTouchEnd, { passive: true, capture: true });
      window.addEventListener('touchcancel', handleGlobalTouchEnd, { passive: true, capture: true });
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchmove', handleGlobalTouchMove, { capture: true });
        window.removeEventListener('touchend', handleGlobalTouchEnd, { capture: true });
        window.removeEventListener('touchcancel', handleGlobalTouchEnd, { capture: true });
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  const handleProgramClick = (index: number) => {
    if (disabled) return;
    const program = programs[index];
    if (program) {
      onProgramSelect(program);
      if (soundEnabled) {
        soundManager.playDialClick();
      }
      if (hapticEnabled) {
        hapticFeedback.light();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-sm mx-auto aspect-square z-10"
      aria-label="Program selector knob"
      role="slider"
      aria-valuemin={0}
      aria-valuemax={programs.length - 1}
      aria-valuenow={selectedIndex}
    >
      {/* Full-cover grabber overlay — the real touch/mouse target.
           Covers the entire container so you can grab anywhere to rotate.
           touch-action:none prevents the browser from stealing scroll/zoom
           gestures anywhere on the ring area. */}
      <div
        className="absolute inset-0 z-20 rounded-full select-none"
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        aria-hidden={disabled}
      />

      {/* Programs positioned around the knob (z-30 so taps still work
           over the grabber overlay on those tiny icon hit-areas). */}
      {programs.map((program, index) => {
        // Calculate angle so that index 0 is at the top (aligned with indicator)
        // Using -90 to start from top in CSS coordinate system
        const angle = (index * anglePerProgram) - 90;
        const radius = 40; // percentage - closer to center for better spacing
        const x = Math.round((50 + radius * Math.cos(angle * Math.PI / 180)) * 100) / 100;
        const y = Math.round((50 + radius * Math.sin(angle * Math.PI / 180)) * 100) / 100;
        
        const isSelected = program.id === selectedProgram.id;
        
        return (
          <button
            key={program.id}
            onClick={() => handleProgramClick(index)}
            disabled={disabled}
            className={`
              z-30 absolute transform -translate-x-1/2 -translate-y-1/2
              text-xs font-medium transition-all duration-200
              min-h-[40px] min-w-[40px] flex items-center justify-center text-2xl
              ${isSelected 
                ? 'text-cyan-400 scale-110 font-bold' 
                : 'text-gray-400 hover:text-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
            }}
            aria-label={`Select ${program.name} program`}
            aria-pressed={isSelected}
          >
            {program.icon}
          </button>
        );
      })}

      {/* Main knob visual only — no direct listeners. All touches go
           through the full-cover grabber above so you can grab the dead
           margin around the circle on narrow phones. */}
      <div
        ref={knobRef}
        className={`
          pointer-events-none
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-[256px] aspect-square h-auto rounded-full
          bg-gradient-to-br from-gray-800 to-gray-900
          border-4 border-gray-700 shadow-2xl
          ${disabled ? 'opacity-50' : ''}
          ${isDragging ? '' : 'transition-transform duration-150 ease-out'}
        `}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* Knob texture/ridges */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15) * (Math.PI / 180);
            const x1 = Math.round((50 + 45 * Math.cos(angle)) * 100) / 100;
            const y1 = Math.round((50 + 45 * Math.sin(angle)) * 100) / 100;
            const x2 = Math.round((50 + 48 * Math.cos(angle)) * 100) / 100;
            const y2 = Math.round((50 + 48 * Math.sin(angle)) * 100) / 100;
            
            return (
              <div
                key={i}
                className="absolute bg-gray-600 opacity-30"
                style={{
                  left: `${x1}%`,
                  top: `${y1}%`,
                  width: '2px',
                  height: '6px',
                  transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
                }}
              />
            );
          })}
        </div>

        {/* Indicator line */}
        <div 
          className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-cyan-400 rounded-full"
          style={{
            boxShadow: '0 0 8px rgba(34, 211, 238, 0.8)',
          }}
        />

        {/* Center display — counter-rotated so text stays upright */}
        <div 
          className="absolute top-1/2 left-1/2 transform translate-x-[-50%] translate-y-[-50%] rotate-[var(--counter)]
          w-1/2 max-w-[128px] aspect-square rounded-full bg-gray-900 border-2 border-gray-700
          flex items-center justify-center shadow-inner"
          style={{
            // Use CSS variable so the counter-rotate is applied *after* the
            // knob's rotate above, regardless of the translate-xy shorthand
            // above it in className.
            ['--counter' as any]: `${-rotation}deg`,
          } as React.CSSProperties}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">{selectedProgram.icon}</div>
            <div className="text-xs text-gray-400 font-medium">{selectedProgram.name}</div>
          </div>
        </div>
      </div>

      {/* Fixed indicator at top */}
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        w-6 h-6 bg-cyan-400 rounded-full shadow-lg"
        style={{
          boxShadow: '0 0 12px rgba(34, 211, 238, 0.8)',
        }}
      />
    </div>
  );
}