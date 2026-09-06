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
    // Calculate rotation so the selected program aligns with the top indicator
    // The indicator is at the top, so we need to rotate the knob so the selected program points to it
    const targetRotation = -selectedIndex * anglePerProgram;
    setRotation(targetRotation);
  }, [selectedIndex, anglePerProgram]);

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
    const angleDelta = currentAngle - startAngle;
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
    
    // Snap to nearest program
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const programIndex = Math.round(normalizedRotation / anglePerProgram) % programs.length;
    const targetRotation = -programIndex * anglePerProgram;
    
    setRotation(targetRotation);
    
    // Ensure correct program is selected
    const targetProgram = programs[programIndex];
    if (targetProgram) {
      onProgramSelect(targetProgram);
    }
  }, [isDragging, rotation, anglePerProgram, programs, onProgramSelect]);

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
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX, e.clientY);
      };
      
      const handleGlobalMouseUp = () => {
        handleEnd();
      };
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
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
      {/* Programs positioned around the knob */}
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
              absolute transform -translate-x-1/2 -translate-y-1/2
              text-xs font-medium transition-all duration-200
              ${isSelected 
                ? 'text-cyan-400 scale-110 font-bold' 
                : 'text-gray-400 hover:text-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            aria-label={`Select ${program.name} program`}
            aria-pressed={isSelected}
          >
            {program.icon}
          </button>
        );
      })}

      {/* Main knob */}
      <div
        ref={knobRef}
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-64 h-64 rounded-full
          bg-gradient-to-br from-gray-800 to-gray-900
          border-4 border-gray-700 shadow-2xl
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          transition-transform duration-75 ease-out
        `}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        aria-hidden="true"
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

        {/* Center display */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          w-32 h-32 rounded-full bg-gray-900 border-2 border-gray-700
          flex items-center justify-center shadow-inner"
          style={{
            transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
          }}
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