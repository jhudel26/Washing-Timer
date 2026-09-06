'use client';

import { useState, useEffect, useRef } from 'react';

type DrumState = 'idle' | 'washing' | 'rinsing' | 'spinning' | 'paused' | 'finished';

interface WashingDrumProps {
  state: DrumState;
  spinSpeed?: number; // RPM
  reducedMotion?: boolean;
}

export default function WashingDrum({ 
  state, 
  spinSpeed = 0,
  reducedMotion = false 
}: WashingDrumProps) {
  const [rotation, setRotation] = useState(0);
  const [direction, setDirection] = useState(1);
  const [waterLevel, setWaterLevel] = useState(0);
  const animationRef = useRef<number | undefined>();
  const lastTimeRef = useRef<number | undefined>();

  useEffect(() => {
    if (reducedMotion) {
      setRotation(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      let speed = 0;
      let targetWaterLevel = 0;

      switch (state) {
        case 'washing':
          speed = 2; // Slow rotation
          targetWaterLevel = 60;
          // Occasionally reverse direction
          if (Math.random() < 0.005) {
            setDirection(prev => -prev);
          }
          break;
        case 'rinsing':
          speed = 4; // Moderate rotation
          targetWaterLevel = 80;
          break;
        case 'spinning':
          speed = spinSpeed / 100; // Fast rotation based on RPM
          targetWaterLevel = 0;
          break;
        case 'paused':
          speed = 0;
          break;
        case 'finished':
          speed = 0;
          targetWaterLevel = 0;
          break;
        case 'idle':
        default:
          speed = 0;
      }

      setRotation(prev => (prev + speed * direction * (deltaTime / 16)) % 360);
      setWaterLevel(prev => {
        const diff = targetWaterLevel - prev;
        return prev + diff * 0.05;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, spinSpeed, direction, reducedMotion]);

  const getClothingTransform = (index: number, total: number) => {
    const angle = (index / total) * 360;
    const radius = Math.round((30 + Math.sin(angle * Math.PI / 180) * 10) * 100) / 100;
    const x = Math.round((50 + radius * Math.cos((angle + rotation) * Math.PI / 180)) * 100) / 100;
    const y = Math.round((50 + radius * Math.sin((angle + rotation) * Math.PI / 180)) * 100) / 100;
    return { x, y };
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto aspect-square"
      aria-label="Washing machine drum"
      role="img"
    >
      {/* Outer metallic ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-600 via-gray-500 to-gray-600 shadow-2xl">
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-800">
          {/* Dark glass door */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            {/* Glass reflection */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
              }}
            />

            {/* Water effect */}
            {waterLevel > 0 && (
              <div 
                className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-1000"
                style={{
                  height: `${waterLevel}%`,
                  background: 'linear-gradient(to top, rgba(34, 211, 238, 0.3), rgba(34, 211, 238, 0.1))',
                  filter: 'blur(2px)',
                }}
              />
            )}

            {/* Inner drum */}
            <div 
              className="absolute inset-6 rounded-full bg-gray-950 border-4 border-gray-700"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: reducedMotion ? 'none' : 'none',
              }}
            >
              {/* Drum perforations */}
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = (i * 10) * (Math.PI / 180);
                const radius = 40;
                const x = Math.round((50 + radius * Math.cos(angle)) * 100) / 100;
                const y = Math.round((50 + radius * Math.sin(angle)) * 100) / 100;
                
                return (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-gray-800 rounded-full"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                );
              })}

              {/* Clothing/fabric shapes */}
              {Array.from({ length: 6 }).map((_, i) => {
                const { x, y } = getClothingTransform(i, 6);
                const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
                
                return (
                  <div
                    key={i}
                    className="absolute w-4 h-6 rounded opacity-70"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      backgroundColor: colors[i],
                      transform: 'translate(-50%, -50%)',
                      boxShadow: `0 2px 4px rgba(0,0,0,0.3)`,
                    }}
                  />
                );
              })}

              {/* Center hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-500" />
            </div>

            {/* Glass door handle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-gray-600 bg-transparent" />
            
            {/* Door frame */}
            <div className="absolute inset-0 rounded-full border-8 border-gray-600" style={{
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
            }} />
          </div>
        </div>
      </div>

      {/* Status indicator light */}
      <div 
        className={`
          absolute top-4 right-4 w-3 h-3 rounded-full transition-colors duration-300
          ${state === 'washing' || state === 'rinsing' || state === 'spinning' 
            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' 
            : state === 'paused' 
              ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]'
              : state === 'finished'
                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                : 'bg-gray-600'
          }
        `}
        aria-label={`Drum status: ${state}`}
      />

      {/* Spin speed indicator */}
      {state === 'spinning' && spinSpeed > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/80 px-3 py-1 rounded-full text-xs text-cyan-400 font-mono">
          {spinSpeed} RPM
        </div>
      )}

      {/* Completion indicator */}
      {state === 'finished' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-green-400 font-bold text-sm">DONE</span>
          </div>
        </div>
      )}
    </div>
  );
}