import { ShowcaseItem } from "@/types";
import { Clock } from "@/components/library/Clock/Clock";
import { Calendar } from "@/components/library/Calendar/Calendar";
import { FlipCalendar } from "@/components/library/FlipCalendar/FlipCalendar";

export const showcaseItems: ShowcaseItem[] = [
  {
    id: "clock-1",
    name: "Analog Clock",
    category: "UI Components",
    component: Clock,
    code: {
      tsx: `'use client';

import { useState, useEffect } from 'react';

export const Clock = () => {
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
    id: "calendar-1",
    name: "Date Calendar",
    category: "UI Components",
    component: Calendar,
    code: {
      tsx: `'use client';

import { useState, useEffect } from 'react';

export const Calendar = () => {
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
    category: "UI Components",
    component: FlipCalendar,
    code: {
      tsx: `'use client';

import React, { useState } from 'react';

export const FlipCalendar = () => {
  const [isFlipping, setIsFlipping] = useState(false);

  const toggleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 700);
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div
        onClick={toggleFlip}
        className="relative w-[320px] h-[320px] cursor-pointer"
        style={{ perspective: 1400 }}
        aria-hidden
      >
        {/* --- STACK BASES (depth) --- */}
        <div
          className="absolute left-6 right-6 bottom-[-34px] rounded-[36px]"
          style={{
            height: 46,
            background: 'linear-gradient(180deg,#07245a,#06183a)',
            filter: 'blur(8px)',
            opacity: 0.45,
            transform: 'translateY(18px)',
          }}
        />
        <div
          className="absolute left-2 right-2 bottom-[-18px] rounded-[36px]"
          style={{
            height: 64,
            background: 'linear-gradient(180deg,#0f3db2,#0a2d77)',
            boxShadow: '0 20px 40px rgba(2,6,23,0.6)',
            transform: 'translateY(8px)',
          }}
        />

        {/* --- MAIN CARD --- */}
        <div
          className="relative w-full h-full rounded-[36px] overflow-hidden"
          style={{
            background: 'linear-gradient(180deg,#2e70ff 0%, #1558d6 60%)',
            boxShadow:
              '0 10px 30px rgba(6,12,35,0.6), inset 0 6px 18px rgba(255,255,255,0.02)',
          }}
        >
          {/* Top half (front face) */}
          <div className="relative h-1/2 flex flex-col items-center justify-end pb-4">
            <span className="text-[30px] text-[#b7d0ff] font-extralight tracking-tight">Mon</span>
            <div
              className="absolute w-full flex items-end justify-center pointer-events-none"
              style={{ bottom: 6 }}
            >
              <div className="text-[140px] font-extralight leading-none text-white select-none">23</div>
            </div>
            {/* inner crease shadow at bottom of top half */}
            <div
              className="absolute left-0 right-0 bottom-0 pointer-events-none"
              style={{
                height: 18,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))',
              }}
            />
          </div>

          {/* Seam (divider) */}
          <div
            className="relative z-10"
            style={{
              height: 6,
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.35), rgba(255,255,255,0.05) 30%, rgba(0,0,0,0.3) 70%)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.45) inset',
            }}
          />

          {/* Bottom half */}
          <div className="relative h-1/2 flex flex-col items-center justify-start pt-4 overflow-hidden">
            {/* crease shadow from top */}
            <div
              className="absolute left-0 right-0 top-0 pointer-events-none"
              style={{
                height: 36,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0))',
                zIndex: 8,
                transform: 'translateY(-6px)',
              }}
            />
            <div className="text-[140px] font-extralight leading-none text-white select-none translate-y-[-12%]">
              23
            </div>
          </div>

          {/* --- FLIP LEAF (front face) --- */}
          <div
            className="absolute left-0 right-0 top-0 h-1/2 z-30 rounded-t-[36px] overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom center',
              transition: 'transform 700ms cubic-bezier(.2,.9,.3,1), opacity 400ms',
              transform: isFlipping ? 'rotateX(-180deg)' : 'rotateX(0deg)',
              backfaceVisibility: 'hidden',
            }}
          >
            <div
              className="w-full h-full flex flex-col items-center justify-end pb-4"
              style={{
                background: 'linear-gradient(180deg,#2c6bff,#1560d4)',
                boxShadow: 'inset 0 -6px 18px rgba(0,0,0,0.3)',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <span className="text-[30px] text-[#b7d0ff] font-extralight tracking-tight">Mon</span>
              <div className="text-[140px] font-extralight leading-none text-white select-none">23</div>
              <div
                className="absolute left-0 right-0 bottom-0"
                style={{
                  height: 16,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.45), transparent)',
                }}
              />
            </div>
          </div>

          {/* --- FLIP LEAF BACK SIDE --- */}
          <div
            className="absolute left-0 right-0 top-0 h-1/2 z-20 rounded-t-[36px] overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom center',
              transition: 'transform 700ms cubic-bezier(.2,.9,.3,1)',
              transform: isFlipping ? 'rotateX(0deg)' : 'rotateX(180deg)',
              backfaceVisibility: 'hidden',
            }}
          >
            <div
              className="w-full h-full flex items-end justify-center pb-4"
              style={{
                background: 'linear-gradient(180deg,#133a92,#071a43)',
                boxShadow: 'inset 0 -12px 24px rgba(0,0,0,0.55)',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <span className="text-[30px] text-[#8aa6ff] font-extralight tracking-tight">Mon</span>
              <div className="text-[140px] font-extralight leading-none text-white/80 select-none">23</div>
            </div>
          </div>

          {/* --- GLOSSY OVERLAY --- */}
          <div
            className="absolute inset-0 rounded-[36px] pointer-events-none"
            style={{
              background:
                'linear-gradient(140deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.005) 60%, transparent 100%)',
            }}
          />

          {/* bevel highlight */}
          <div
            className="absolute left-6 top-6 w-[70%] h-8 rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0))',
              transform: 'rotate(-8deg)',
            }}
          />
        </div>
      </div>
    </div>
  );
};`,
      css: `/* No external CSS needed - uses Tailwind classes */`,
    },
  },
];
