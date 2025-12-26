'use client';

import React, { useState, useEffect } from 'react';

export const FlipCalendar = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFlip = () => {
    if (!isFlipping) {
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 700);
    }
  };

  const day = currentDate.toLocaleString('en-US', { weekday: 'short' });
  const date = currentDate.getDate();

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div 
        onClick={handleFlip}
        className="relative w-72 h-72 cursor-pointer group"
        style={{ perspective: '1000px' }}
      >
        {/* THE STACK - 3 Layers at the bottom to create depth */}
        {/* Layer 3 (Deepest) */}
        <div className="absolute inset-x-4 bottom-[-16px] h-20 bg-blue-900 rounded-[3rem] opacity-40 blur-sm" />
        
        <div className="absolute inset-x-1 bottom-[-8px] h-full bg-blue-800 rounded-[3.5rem] shadow-lg" />
        {/* Layer 2 (Middle) */}
        
        {/* Layer 1 (Top/Main Body) */}
        <div className="relative w-full h-full bg-blue-600 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col">
          
          {/* TOP HALF */}
          <div className="relative flex-1 bg-linear-to-b from-blue-500 to-blue-600 flex flex-col items-center justify-end overflow-hidden">
            <span className="text-white text-4xl font-extralight tracking-tight mb-2 z-10 relative">{day}</span>
            <div className="text-[11rem] font-extralight text-white leading-none translate-y-[50%]">
              {date}
            </div>
            {/* The "Inner Shadow" at the bottom of the top half */}
            <div className="absolute bottom-0 w-full h-6 bg-linear-to-t from-black/20 to-transparent" />
          </div>

          {/* THE SEAM (Horizontal Divider) */}
          <div className="h-px w-full bg-black/30 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.4)]" />

          {/* BOTTOM HALF */}
          <div className="relative flex-1 bg-blue-600 flex flex-col items-center justify-start overflow-hidden">
            {/* Darker crease shadow cast from the top fold */}
            <div className="absolute top-0 w-full h-12 bg-linear-to-b from-black/50 to-transparent z-10" />
            
            <div className="text-[11rem] font-extralight text-white leading-none -translate-y-[50%]">
              {date}
            </div>
          </div>

          {/* ANIMATED FLIP LEAF */}
          <div 
            className={`absolute inset-x-0 top-0 h-1/2 bg-blue-500 rounded-t-[3.5rem] origin-bottom transition-all duration-700 ease-in-out z-30 overflow-hidden 
              ${isFlipping ? 'opacity-0' : 'opacity-100'}`}
            style={{
              transform: isFlipping ? 'rotateX(-180deg)' : 'rotateX(0deg)',
            }}
          >
             <div className="flex flex-col items-center justify-end h-full relative">
                <span className="text-black text-4xl font-extralight tracking-tight mb-2 z-50 relative">{day}</span>
                <div className="text-[11rem] font-extralight text-white leading-none translate-y-[50%]">
                  {date}
                </div>
                {/* Crease shadow on the leaf */}
                <div className="absolute bottom-0 w-full h-6 bg-linear-to-t from-black/20 to-transparent" />
             </div>
          </div>
        </div>

        {/* Glossy Overlay for that Glass/Plastic look */}
        <div className="absolute inset-0 rounded-[3.5rem] pointer-events-none bg-linear-to-tr from-transparent via-white/5 to-white/10" />
      </div>
    </div>
  );
};
