'use client';

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
        {/* Clock face - dark circle */}
        <circle cx="100" cy="100" r="90" fill="#141414"/>
        
        {/* Outer ring */}
        <circle cx="100" cy="100" r="85" fill="none" strokeWidth="2"/>
        
        {/* Minute markers - small lines */}
        {[...Array(60)].map((_, i) => {
          if (i % 5 !== 0) {
            const angle = (i * 6 - 90) * Math.PI / 180;
            const x1 = 100 + Math.cos(angle) * 85;
            const y1 = 100 + Math.sin(angle) * 85;
            const x2 = 100 + Math.cos(angle) * 80;
            const y2 = 100 + Math.sin(angle) * 80;
            return (
              <line 
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke="white" 
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          }
          return null;
        })}
        
        {/* Hour markers - larger lines */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x1 = 100 + Math.cos(angle) * 85;
          const y1 = 100 + Math.sin(angle) * 85;
          const x2 = 100 + Math.cos(angle) * 78;
          const y2 = 100 + Math.sin(angle) * 78;
          return (
            <line 
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2} 
              stroke="white" 
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          );
        })}
        
        {/* Hour numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x = 100 + Math.cos(angle) * 62;
          const y = 100 + Math.sin(angle) * 62;
          return (
            <text
              key={num}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="16"
              fontWeight="500"
              fill="white"
              fontFamily="Helvetica, Arial, sans-serif"
            >
              {num}
            </text>
          );
        })}
        
        {/* Hour hand */}
        <g style={{
          transform: `rotate(${hourAngle}deg)`,
          transformOrigin: '100px 100px',
          transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}>
          <rect x="97" y="55" width="6" height="45" rx="3" fill="white" />
        </g>
        
        {/* Minute hand */}
        <g style={{
          transform: `rotate(${minuteAngle}deg)`,
          transformOrigin: '100px 100px',
          transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}>
          <rect x="98" y="30" width="4" height="70" rx="2" fill="white" />
        </g>
        
        {/* Second hand - orange */}
        <line
          x1="100" y1="115" x2="100" y2="20"
          stroke="#FF9500" 
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            transform: `rotate(${secondAngle}deg)`,
            transformOrigin: '100px 100px',
            transition: 'none'
          }}
        />
        
        {/* Center dot */}
        <circle cx="100" cy="100" r="5" fill="black" stroke="white" strokeWidth="2"/>
      </svg>
    </div>
  );
};
