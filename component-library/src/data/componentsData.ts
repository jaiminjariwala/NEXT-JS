import { ShowcaseItem } from "@/types";
import { AnalogClock } from "@/components/library/Clock/AnalogClock/AnalogClock";
import { DateCalendar } from "@/components/library/Calendar/DateCalendar/DateCalendar";
import { FlipCalendar } from "@/components/library/Calendar/FlipCalendar/FlipCalendar";

export const showcaseItems: ShowcaseItem[] = [
  {
    id: "analog-clock-1",
    name: "Analog Clock",
    category: "Clock",
    component: AnalogClock,
    code: {
      tsx: `'use client';

import { useState, useEffect } from 'react';

export const AnalogClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;

  return (
    <div className="flex items-center justify-center w-60 h-60 sm:w-80 sm:h-80 rounded-3xl">
      <svg className="w-80 h-80" viewBox="0 0 200 200">
        {/* Clock face */}
        <circle cx="100" cy="100" r="90" fill="#141414"/>
        <circle cx="100" cy="100" r="85" fill="none" strokeWidth="2"/>
        
        {/* Minute markers */}
        {[...Array(60)].map((_, i) => {
          if (i % 5 !== 0) {
            const angle = (i * 6 - 90) * Math.PI / 180;
            const x1 = 100 + Math.cos(angle) * 85;
            const y1 = 100 + Math.sin(angle) * 85;
            const x2 = 100 + Math.cos(angle) * 80;
            const y2 = 100 + Math.sin(angle) * 80;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1.5" strokeLinecap="round"/>;
          }
          return null;
        })}
        
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x1 = 100 + Math.cos(angle) * 85;
          const y1 = 100 + Math.sin(angle) * 85;
          const x2 = 100 + Math.cos(angle) * 78;
          const y2 = 100 + Math.sin(angle) * 78;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2.4" strokeLinecap="round"/>;
        })}
        
        {/* Numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x = 100 + Math.cos(angle) * 62;
          const y = 100 + Math.sin(angle) * 62;
          return <text key={num} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="500" fill="white">{num}</text>;
        })}
        
        {/* Hour hand */}
        <g style={{ transform: \`rotate(\${hourAngle}deg)\`, transformOrigin: '100px 100px', transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)' }}>
          <rect x="97" y="55" width="6" height="45" rx="3" fill="white" />
        </g>
        
        {/* Minute hand */}
        <g style={{ transform: \`rotate(\${minuteAngle}deg)\`, transformOrigin: '100px 100px', transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)' }}>
          <rect x="98" y="30" width="4" height="70" rx="2" fill="white" />
        </g>
        
        {/* Second hand */}
        <line x1="100" y1="115" x2="100" y2="20" stroke="#FF9500" strokeWidth="1.5" strokeLinecap="round" 
          style={{ transform: \`rotate(\${secondAngle}deg)\`, transformOrigin: '100px 100px', transition: 'none' }}
        />
        
        {/* Center */}
        <circle cx="100" cy="100" r="5" fill="black" stroke="white" strokeWidth="2"/>
      </svg>
    </div>
  );
};`,
      css: `/* No external CSS needed - uses Tailwind classes */`,
    },
  },
  {
    id: "date-calendar-1",
    name: "Date Calendar",
    category: "Calendar",
    component: DateCalendar,
    code: {
      tsx: `'use client';

import { useState, useEffect } from 'react';

export const DateCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = currentDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();

  return (
    <div className="bg-green-600 w-[240px] border-[5px] border-black rounded-[20px] aspect-[1.5] relative p-2.5 flex flex-col">
      {/* Holes at the top */}
      <div className="grid grid-cols-6 gap-1 mb-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="w-7 h-7 bg-white rounded-full border-[5px] border-black"
          />
        ))}
      </div>

      {/* Date content */}
      <div className="flex flex-col justify-center items-start flex-grow">
        <span
          className="text-[6rem] font-bold leading-[0.75] text-black m-0 p-0 block"
          style={{
            WebkitTextStroke: '2px black',
          }}
        >
          {day}
        </span>
        <span
          className="text-[6rem] font-bold leading-[0.9] text-black m-0 p-0 block"
          style={{
            WebkitTextStroke: '2px black',
          }}
        >
          {month}
        </span>
      </div>
    </div>
  );
};`,
      css: `/* No external CSS needed - uses Tailwind classes */`,
    },
  },
  {
    id: "flip-calendar-1",
    name: "Flip Calendar",
    category: "Calendar",
    component: FlipCalendar,
    code: {
      tsx: `'use client';

import React, { useState, useEffect, useRef } from 'react';

export const FlipCalendar = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState('next');
  const [displayDate, setDisplayDate] = useState(new Date());
  const [targetDate, setTargetDate] = useState(new Date());
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayTimerRef = useRef(null);

  // Auto-play demo on mount
  useEffect(() => {
    if (!isAutoPlay) return;

    const startAutoPlay = () => {
      let count = 0;
      const flipTypes = ['next', 'prev', 'next', 'prev'];

      const runDemo = () => {
        if (count < flipTypes.length && isAutoPlay) {
          handleFlip(flipTypes[count], true);
          count++;
          autoPlayTimerRef.current = setTimeout(runDemo, 2500);
        } else {
          count = 0;
          autoPlayTimerRef.current = setTimeout(runDemo, 1000);
        }
      };

      autoPlayTimerRef.current = setTimeout(runDemo, 500);
    };

    startAutoPlay();

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlay]);

  const handleFlip = (type, isAuto = false) => {
    if (isFlipping) return;

    if (!isAuto && isAutoPlay) {
      setIsAutoPlay(false);
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    }

    const next = new Date(displayDate);
    if (type === 'next') {
      next.setDate(next.getDate() + 1);
      setDirection('next');
    } else {
      next.setDate(next.getDate() - 1);
      setDirection('prev');
    }

    setTargetDate(next);
    setIsFlipping(true);

    setTimeout(() => {
      setDisplayDate(next);
      setIsFlipping(false);
    }, 1500);
  };

  const currDay = displayDate.toLocaleString('en-US', { weekday: 'short' });
  const currNum = displayDate.getDate();
  const targetDay = targetDate.toLocaleString('en-US', { weekday: 'short' });
  const targetNum = targetDate.getDate();

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div 
        className="relative w-60 h-60 cursor-pointer select-none"
        style={{ perspective: '2000px' }}
      >
        <div className="absolute inset-x-4 bottom-[-16px] h-20 bg-blue-900 rounded-[3rem] opacity-40 blur-sm" />
        <div className="absolute inset-x-1 bottom-[-8px] h-full bg-blue-800 rounded-[3.5rem] shadow-lg" />
        
        <div className="relative w-full h-full bg-blue-600 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col">
          <div 
            onClick={() => handleFlip('prev')}
            className="relative flex-1 bg-blue-600 flex flex-col items-center justify-end overflow-hidden z-10"
          >
             <div 
               className={\`flex flex-col items-center transition-opacity duration-[1500ms] ease-in-out 
               \${isFlipping && direction === 'next' ? 'opacity-0' : 'opacity-100'}\`}
             >
                <span className="text-white text-4xl font-extralight tracking-tight mb-2">
                    {isFlipping && direction === 'prev' ? targetDay : currDay}
                </span>
                <div className="text-[11rem] font-extralight text-white leading-none translate-y-[50%]">
                    {isFlipping && direction === 'prev' ? targetNum : currNum}
                </div>
             </div>
          </div>

          <div className="h-px w-full bg-black/20 z-20" />

          <div 
            onClick={() => handleFlip('next')}
            className="relative flex-1 bg-blue-600 flex flex-col items-center justify-start overflow-hidden"
          >
            <div 
                className={\`transition-opacity duration-[1500ms] ease-in-out 
                \${isFlipping && direction === 'prev' ? 'opacity-0' : 'opacity-100'}\`}
            >
                <div className="text-[11rem] font-extralight text-white leading-none -translate-y-[50%]">
                    {isFlipping && direction === 'next' ? targetNum : currNum}
                </div>
            </div>
          </div>

          <div 
            className={\`absolute inset-x-0 bottom-0 h-1/2 bg-blue-600 rounded-b-[3.5rem] origin-top overflow-hidden
              \${isFlipping && direction === 'next' ? 'z-30' : 'z-[-1]'}\`}
            style={{
              transform: (isFlipping && direction === 'next') ? 'rotateX(-180deg)' : 'rotateX(0deg)',
              transition: (isFlipping && direction === 'next') ? 'transform 1500ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="flex flex-col items-center justify-start h-full">
               <div className="text-[11rem] font-extralight text-white leading-none -translate-y-[50%]">
                {currNum}
              </div>
            </div>
          </div>

          <div 
            className={\`absolute inset-x-0 top-0 h-1/2 bg-blue-600 rounded-t-[3.5rem] origin-bottom overflow-hidden
              \${isFlipping && direction === 'next' ? 'z-40' : 'z-[-1]'}\`}
            style={{
              transform: (isFlipping && direction === 'next') ? 'rotateX(0deg)' : 'rotateX(180deg)',
              transition: (isFlipping && direction === 'next') ? 'transform 1500ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
             <div className="flex flex-col items-center justify-end h-full">
                <span className="text-white text-4xl font-extralight tracking-tight mb-2">{targetDay}</span>
                <div className="text-[11rem] font-extralight text-white leading-none translate-y-[50%]">
                  {targetNum}
                </div>
             </div>
          </div>

          <div 
            className={\`absolute inset-x-0 top-0 h-1/2 bg-blue-600 rounded-t-[3.5rem] origin-bottom overflow-hidden
              \${isFlipping && direction === 'prev' ? 'z-30' : 'z-[-1]'}\`}
            style={{
              transform: (isFlipping && direction === 'prev') ? 'rotateX(180deg)' : 'rotateX(0deg)',
              transition: (isFlipping && direction === 'prev') ? 'transform 1500ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="flex flex-col items-center justify-end h-full">
               <span className="text-white text-4xl font-extralight tracking-tight mb-2">{currDay}</span>
               <div className="text-[11rem] font-extralight text-white leading-none translate-y-[50%]">
                {currNum}
              </div>
            </div>
          </div>

          <div 
            className={\`absolute inset-x-0 bottom-0 h-1/2 bg-blue-600 rounded-b-[3.5rem] origin-top overflow-hidden
              \${isFlipping && direction === 'prev' ? 'z-40' : 'z-[-1]'}\`}
            style={{
              transform: (isFlipping && direction === 'prev') ? 'rotateX(0deg)' : 'rotateX(-180deg)',
              transition: (isFlipping && direction === 'prev') ? 'transform 1500ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
             <div className="flex flex-col items-center justify-start h-full">
                <div className="text-[11rem] font-extralight text-white leading-none -translate-y-[50%]">
                  {targetNum}
                </div>
             </div>
          </div>
        </div>

        <div className="absolute inset-0 rounded-[3.5rem] pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
      </div>
    </div>
  );
};`,
      css: `/* No external CSS needed - uses Tailwind classes */`,
    },
  },
];
