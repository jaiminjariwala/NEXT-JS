import { ComponentVersion } from "@/types";
import { AnalogClock } from "@/components/library/Clock/AnalogClock/AnalogClock";
import { AnalogClockV2 } from "@/components/library/Clock/AnalogClockV2/AnalogClockV2";
import { AnalogClockV3 } from "@/components/library/Clock/AnalogClockV3/AnalogClockV3";

export const analogClockVersions: ComponentVersion[] = [
  {
    id: "analog-clock-v1",
    name: "Version 1",
    component: AnalogClock,
    code: {
      tsx: `'use client';

import React, { useState, useEffect, useMemo } from 'react';

export const AnalogClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 50);
    return () => clearInterval(timer);
  }, []);

  const cityAbbreviation = useMemo(() => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const cityMap = {
      'America/New_York': 'NYC',
      'America/Los_Angeles': 'LA',
      'America/Chicago': 'CHI',
      // ... other cities
    };
    
    return cityMap[userTimeZone] || 'UTC';
  }, []);

  const { dcDate } = useMemo(() => {
    const dcString = time.toLocaleString("en-US", { timeZone: "America/New_York" });
    const dcDate = new Date(dcString);
    return { dcDate };
  }, [time]);

  const h = dcDate.getHours();
  const m = dcDate.getMinutes();
  const s = dcDate.getSeconds();
  const ms = time.getMilliseconds();

  const hourAngle = ((h % 12) + m / 60) * 30;
  const minuteAngle = (m + s / 60) * 6;
  const secondAngle = (s + ms / 1000) * 6;

  const ticks = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const isHour = i % 5 === 0;
      return (
        <line
          key={i}
          x1="100" y1={isHour ? 5 : 5}
          x2="100" y2={isHour ? 17 : 13}
          stroke={isHour ? "#FFFFFF" : "#525252"}
          strokeWidth={isHour ? 2.8 : 1.2}
          strokeLinecap="round"
          transform={\`rotate(\${i * 6} 100 100)\`}
        />
      );
    });
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px'}}>
      <div style={{
        width: '320px', height: '320px',
        background: 'linear-gradient(145deg, #2c2c2c, #1a1a1a)',
        borderRadius: '64px', padding: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: '100%', height: '100%',
          backgroundColor: '#000000', borderRadius: '50%',
          position: 'relative', overflow: 'hidden',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.9)'
        }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <defs>
              <filter id="handShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.6" />
              </filter>
            </defs>
            <g>{ticks}</g>
            <text x="100" y="75" textAnchor="middle" fill="#525252" 
              style={{ fontSize: '26px', fontWeight: '800' }}>{cityAbbreviation}</text>
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x = 100 + Math.sin(angle) * 68;
              const y = 100 - Math.cos(angle) * 68;
              return <text key={num} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" 
                style={{ fontSize: '20px', fontWeight: '700' }}>{num}</text>;
            })}
            <g transform={\`rotate(\${hourAngle} 100 100)\`} filter="url(#handShadow)">
              <rect x="98.5" y="90" width="3" height="12" rx="1.5" fill="white" />
              <rect x="96" y="46" width="8" height="47" rx="5" fill="white" />
            </g>
            <g transform={\`rotate(\${minuteAngle} 100 100)\`} filter="url(#handShadow)">
              <rect x="99" y="88" width="2" height="15" rx="1" fill="white" />
              <rect x="97" y="20" width="6" height="72" rx="3" fill="white" />
            </g>
            <g transform={\`rotate(\${secondAngle} 100 100)\`}>
              <line x1="100" y1="115" x2="100" y2="18" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
              <circle cx="100" cy="100" r="3.5" fill="#FF9500" />
              <circle cx="100" cy="100" r="1.5" fill="black" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};`,
      css: `/* No external CSS needed - uses inline styles */`,
    }
  },
  {
    id: "analog-clock-v2",
    name: "Version 2",
    component: AnalogClockV2,
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
        <circle cx="100" cy="100" r="90" fill="#141414"/>
        <circle cx="100" cy="100" r="85" fill="none" strokeWidth="2"/>
        
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
        
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x1 = 100 + Math.cos(angle) * 85;
          const y1 = 100 + Math.sin(angle) * 85;
          const x2 = 100 + Math.cos(angle) * 78;
          const y2 = 100 + Math.sin(angle) * 78;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2.4" strokeLinecap="round"/>;
        })}
        
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const x = 100 + Math.cos(angle) * 62;
          const y = 100 + Math.sin(angle) * 62;
          return <text key={num} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="500" fill="white">{num}</text>;
        })}
        
        <g style={{ transform: \`rotate(\${hourAngle}deg)\`, transformOrigin: '100px 100px', transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)' }}>
          <rect x="97" y="55" width="6" height="45" rx="3" fill="white" />
        </g>
        
        <g style={{ transform: \`rotate(\${minuteAngle}deg)\`, transformOrigin: '100px 100px', transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)' }}>
          <rect x="98" y="30" width="4" height="70" rx="2" fill="white" />
        </g>
        
        <line x1="100" y1="115" x2="100" y2="20" stroke="#FF9500" strokeWidth="1.5" strokeLinecap="round" 
          style={{ transform: \`rotate(\${secondAngle}deg)\`, transformOrigin: '100px 100px', transition: 'none' }}
        />
        
        <circle cx="100" cy="100" r="5" fill="black" stroke="white" strokeWidth="2"/>
      </svg>
    </div>
  );
};`,
      css: `/* No external CSS needed - uses Tailwind classes */`,
    }
  },
  {
    id: "analog-clock-v3",
    name: "Version 3",
    component: AnalogClockV3,
    code: {
      tsx: `'use client';

import React, { useState, useEffect, useMemo } from 'react';

export const AnalogClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 50);
    return () => clearInterval(timer);
  }, []);

  const cityAbbreviation = useMemo(() => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cityMap = {
      'America/New_York': 'NYC',
      'America/Los_Angeles': 'LA',
      // ... other cities
    };
    return cityMap[userTimeZone] || 'UTC';
  }, []);

  const { dcDate } = useMemo(() => {
    const dcString = time.toLocaleString("en-US", { timeZone: "America/New_York" });
    const dcDate = new Date(dcString);
    return { dcDate };
  }, [time]);

  const h = dcDate.getHours();
  const m = dcDate.getMinutes();
  const s = dcDate.getSeconds();
  const ms = time.getMilliseconds();

  const hourAngle = ((h % 12) + m / 60) * 30;
  const minuteAngle = (m + s / 60) * 6;
  const secondAngle = (s + ms / 1000) * 6;

  const ticks = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => {
      const isHour = i % 5 === 0;
      return (
        <line
          key={i}
          x1="100" y1={isHour ? 5 : 5}
          x2="100" y2={isHour ? 17 : 13}
          stroke={isHour ? "#1a1a1a" : "#333333"}
          strokeWidth={isHour ? 2.8 : 1.2}
          strokeLinecap="round"
          transform={\`rotate(\${i * 6} 100 100)\`}
        />
      );
    });
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px'}}>
      <div style={{
        width: '320px', height: '320px',
        background: 'linear-gradient(145deg, #d4d9dd, #c5cace)',
        borderRadius: '64px', padding: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          width: '100%', height: '100%',
          backgroundColor: '#f5f5f7', borderRadius: '50%',
          position: 'relative', overflow: 'hidden',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <defs>
              <filter id="handShadowV3">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.3" />
              </filter>
            </defs>
            <g>{ticks}</g>
            <text x="100" y="75" textAnchor="middle" fill="#999999" 
              style={{ fontSize: '26px', fontWeight: '800' }}>{cityAbbreviation}</text>
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x = 100 + Math.sin(angle) * 68;
              const y = 100 - Math.cos(angle) * 68;
              return <text key={num} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#1a1a1a" 
                style={{ fontSize: '20px', fontWeight: '700' }}>{num}</text>;
            })}
            <g transform={\`rotate(\${hourAngle} 100 100)\`} filter="url(#handShadowV3)">
              <rect x="98.5" y="90" width="3" height="12" rx="1.5" fill="#1a1a1a" />
              <rect x="96" y="46" width="8" height="47" rx="5" fill="#1a1a1a" />
            </g>
            <g transform={\`rotate(\${minuteAngle} 100 100)\`} filter="url(#handShadowV3)">
              <rect x="99" y="88" width="2" height="15" rx="1" fill="#1a1a1a" />
              <rect x="97" y="20" width="6" height="72" rx="3" fill="#1a1a1a" />
            </g>
            <g transform={\`rotate(\${secondAngle} 100 100)\`}>
              <line x1="100" y1="115" x2="100" y2="18" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
              <circle cx="100" cy="100" r="3.5" fill="#FF9500" />
              <circle cx="100" cy="100" r="1.5" fill="#f5f5f7" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};`,
      css: `/* No external CSS needed - uses inline styles */`,
    }
  }
];
