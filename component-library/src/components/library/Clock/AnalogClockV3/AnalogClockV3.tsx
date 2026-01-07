'use client';

import React, { useState, useEffect, useMemo } from 'react';

export const AnalogClockV3 = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 50);
    return () => clearInterval(timer);
  }, []);

  const cityAbbreviation = useMemo(() => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const cityMap: Record<string, string> = {
      'America/New_York': 'NYC',
      'America/Los_Angeles': 'LA',
      'America/Chicago': 'CHI',
      'America/Denver': 'DEN',
      'America/Phoenix': 'PHX',
      'America/Detroit': 'DET',
      'America/Cupertino': 'CUP',
      'Europe/London': 'LON',
      'Europe/Paris': 'PAR',
      'Europe/Berlin': 'BER',
      'Europe/Rome': 'ROM',
      'Europe/Madrid': 'MAD',
      'Europe/Amsterdam': 'AMS',
      'Asia/Tokyo': 'TYO',
      'Asia/Shanghai': 'SHA',
      'Asia/Hong_Kong': 'HKG',
      'Asia/Singapore': 'SIN',
      'Asia/Dubai': 'DXB',
      'Asia/Mumbai': 'BOM',
      'Asia/Kolkata': 'BOM',
      'Asia/Delhi': 'DEL',
      'Asia/Bangkok': 'BKK',
      'Asia/Seoul': 'SEL',
      'Australia/Sydney': 'SYD',
      'Australia/Melbourne': 'MEL',
      'Pacific/Auckland': 'AKL',
      'America/Toronto': 'TOR',
      'America/Vancouver': 'VAN',
      'America/Mexico_City': 'MEX',
      'America/Sao_Paulo': 'SAO',
      'America/Buenos_Aires': 'BUE',
      'Africa/Cairo': 'CAI',
      'Africa/Johannesburg': 'JNB',
      'America/Bogota': 'BOG',
      'America/Lima': 'LIM',
      'Europe/Moscow': 'MOW',
      'Europe/Istanbul': 'IST',
      'Asia/Jakarta': 'JKT',
      'Asia/Manila': 'MNL',
      'Asia/Kuala_Lumpur': 'KUL',
      'America/Santiago': 'SCL',
      'America/Caracas': 'CCS',
      'America/Havana': 'HAV',
      'Pacific/Honolulu': 'HNL',
      'America/Anchorage': 'ANC'
    };
    
    return cityMap[userTimeZone] || 'UTC';
  }, []);

  const { dcDate } = useMemo(() => {
    const dcString = time.toLocaleString("en-US", { timeZone: "America/New_York" });
    const dcDate = new Date(dcString);
    
    return { 
      dcDate
    };
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
          transform={`rotate(${i * 6} 100 100)`}
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
              <filter id="handShadowV3" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.3" />
              </filter>
            </defs>

            <g>{ticks}</g>

            <text x="100" y="75" textAnchor="middle" fill="#999999" 
              style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'system-ui, sans-serif' }}>{cityAbbreviation}</text>

            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x = 100 + Math.sin(angle) * 68;
              const y = 100 - Math.cos(angle) * 68;
              return (
                <text key={num} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#1a1a1a" 
                  style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'system-ui, sans-serif' }}>{num}</text>
              );
            })}

            {/* Hour hand - black */}
            <g transform={`rotate(${hourAngle} 100 100)`} filter="url(#handShadowV3)">
              <rect x="98.5" y="90" width="3" height="12" rx="1.5" fill="#1a1a1a" />
              <rect x="96" y="46" width="8" height="47" rx="5" fill="#1a1a1a" />
            </g>

            {/* Minute hand - black */}
            <g transform={`rotate(${minuteAngle} 100 100)`} filter="url(#handShadowV3)">
              <rect x="99" y="88" width="2" height="15" rx="1" fill="#1a1a1a" />
              <rect x="97" y="20" width="6" height="72" rx="3" fill="#1a1a1a" />
            </g>

            {/* Second hand - orange */}
            <g transform={`rotate(${secondAngle} 100 100)`}>
              <line x1="100" y1="115" x2="100" y2="18" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" />
              <circle cx="100" cy="100" r="3.5" fill="#FF9500" />
              <circle cx="100" cy="100" r="1.5" fill="#f5f5f7" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
