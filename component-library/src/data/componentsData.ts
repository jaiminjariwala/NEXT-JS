import { ComponentVersion, ShowcaseItem } from "@/types";
import { FigmaCanvas } from "@/components/library/Canvas/FigmaCanvas/FigmaCanvas";
import { AnalogClock } from "@/components/library/Clock/AnalogClock/AnalogClock";
import { DateCalendar } from "@/components/library/Calendar/DateCalendar/DateCalendar";
import { FlipCalendar } from "@/components/library/Calendar/FlipCalendar/FlipCalendar";
import Card1 from "@/components/library/Card/Card1";
import FoldingLetters from "@/components/library/Card/FoldingLetters";
import HireMeLanyard from "@/components/library/Card/HireMeLanyard";
import ContactPage from "@/components/library/Contact/ContactPage";
import Folder1 from "@/components/library/Folder/Folder1";
import Drawer1 from "@/components/library/Drawer/Drawer1";
import { contactPageCode } from "@/data/code/contactPageCode";
import { foldingLettersCode } from "@/data/code/foldingLettersCode";
import {
  hireMeLanyardCode,
  hireMeLanyardCss,
} from "@/data/code/hireMeLanyardCode";
import { analogClockVersions } from "@/data/versions/analogClockVersions";
import { cardVersions } from "@/data/versions/cardVersions";

type VersionedShowcaseItem = ShowcaseItem & {
  versions?: ComponentVersion[];
};

function formatVersionedName(itemName: string, versionName: string): string {
  const versionMatch = versionName.match(/^Version\s+(\d+)$/i);
  if (versionMatch) {
    return `${itemName} V${versionMatch[1]}`;
  }

  return `${itemName} ${versionName}`;
}

function expandShowcaseItem(item: VersionedShowcaseItem): ShowcaseItem[] {
  if (!item.versions?.length) {
    return [item];
  }

  return item.versions.map((version) => ({
    id: version.id,
    name: formatVersionedName(item.name, version.name),
    category: item.category,
    component: version.component,
    code: version.code,
    hidePreview: item.hidePreview,
  }));
}

const baseShowcaseItems: VersionedShowcaseItem[] = [
  {
    id: "figma-canvas",
    name: "Figma Canvas",
    category: "Canvas",
    component: FigmaCanvas,
    code: {
      tsx: `'use client';
// See FigmaCanvas.tsx for full source`,
      css: `/* No external CSS needed */`,
      sourcePath: "/code/figma-canvas.tsx.txt",
    },
  },
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
    versions: analogClockVersions,
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
  {
    id: "card-1",
    name: "Card",
    category: "Card",
    component: Card1,
    code: {
      tsx: `'use client';

import React, { useState } from 'react';

interface Card1Props {
  title?: string;
  content?: string;
  footer?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const Card1: React.FC<Card1Props> = ({
  title = 'Hello',
  content = 'Trying my hand at neubrutalism. Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima officiis officia, nulla commodi repellat modi ab et ea! Excepturi molestiae voluptatibus voluptatum, quaerat ducimus temporibus alias ut accusamus sed esse!',
  footer = 'Not sure how I feel about it :)',
  onSave,
  onCancel,
}) => {
  return (
    <div className="inline-block">
      <div className="bg-white border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 w-full sm:w-[700px]">
        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-medium text-gray-900 mb-6 sm:mb-8">
          {title}
        </h1>

        {/* Content */}
        <p className="text-gray-600 text-base sm:text-2xl leading-relaxed mb-4 sm:mb-6">
          {content}
        </p>

        {/* Footer */}
        <p className="text-gray-600 text-base sm:text-2xl mb-6 sm:mb-8">
          {footer}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3 sm:gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 sm:px-6 sm:py-3 text-lg sm:text-2xl font-medium text-gray-700 bg-white border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 sm:px-6 sm:py-3 text-lg sm:text-2xl font-medium text-white bg-green-600 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 active:shadow-none active:translate-x-[4px] active:translate-y-[4px] hover:cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card1;`,
      css: `/* No external CSS needed - uses Tailwind classes */`,
    },
    versions: cardVersions,
  },
  {
    id: "folding-letters-1",
    name: "Folding Letters",
    category: "Card",
    component: FoldingLetters,
    code: {
      tsx: foldingLettersCode,
      css: `/* No external CSS needed - uses Tailwind classes and inline styles */`,
    },
  },
  {
    id: "hire-me-lanyard-1",
    name: "Employee ID Card Lanyard",
    category: "Card",
    component: HireMeLanyard,
    code: {
      tsx: hireMeLanyardCode,
      css: hireMeLanyardCss,
    },
  },
  {
    id: "contact-page-1",
    name: "Contact Page",
    category: "Contact",
    component: ContactPage,
    code: {
      tsx: contactPageCode,
      css: `/* Styling is included inside the component for this showcase */`,
      language: "javascript",
      sourcePath: "/code/contact-page.jsx.txt",
    },
  },
  {
    id: "folder-1",
    name: "Glass Folder",
    category: "Folder",
    component: Folder1,
    code: {
      tsx: `import React, { useState } from 'react';

const RefinedGlassFolder: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={styles.container}>
      <div 
        style={styles.folderAnchor}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1. THE MAIN BODY (Backplate) */}
        <div style={styles.backPlate} />

        {/* 2. DYNAMIC IMAGE CARDS - Horizontally Stacked & Tilted */}
        {/* Left Card - Tilted Left */}
        <div style={{ 
          ...styles.paper, 
          ...styles.paperLeft,
          backgroundImage: 'url(/photo-1.jpeg)',
          transform: isHovered 
            ? 'translate(-50%, -60px) translateX(-70px) rotateY(30deg) rotateZ(-18deg)' 
            : 'translate(-50%, -5px) translateX(-30px) rotateY(15deg) rotateZ(-8deg)'
        }} />
        
        {/* Middle Card - Straight */}
        <div style={{ 
          ...styles.paper, 
          ...styles.paperMid,
          backgroundImage: 'url(/photo-2.jpeg)',
          transform: isHovered 
            ? 'translate(-50%, -55px) translateX(0px) rotateZ(4deg)' 
            : 'translate(-50%, 5px) translateX(0px) rotateZ(1deg)'
        }} />
        
        {/* Right Card - Tilted Right */}
        <div style={{ 
          ...styles.paper, 
          ...styles.paperRight,
          backgroundImage: 'url(/photo-3.jpeg)',
          transform: isHovered 
            ? 'translate(-50%, -50px) translateX(70px) rotateY(-30deg) rotateZ(18deg)' 
            : 'translate(-50%, 10px) translateX(30px) rotateY(-15deg) rotateZ(8deg)'
        }} />

        {/* 3. TILTED GLASS FRONT (Asymmetric & Rounded) */}
        <div style={{
          ...styles.glassPerspectiveWrapper,
          transform: isHovered ? 'rotateX(-35deg)' : 'rotateX(-20deg)'
        }}>
          <div style={styles.glassShape}>
            {/* Glossy Overlay */}
            <div style={styles.glassGloss} />
            {/* The "Smoke" Texture */}
            <div style={styles.glassGrain} />
          </div>
        </div>
        
        {/* 4. BOTTOM SHADOW (Grounding) */}
        <div style={{
          ...styles.groundShadow,
          opacity: isHovered ? 0.4 : 0.2,
          transform: \`translateX(-50%) scale(\${isHovered ? 1.1 : 1})\`
        }} />
      </div>
    </div>
  );
};

// --- STYLES ---

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '30rem',
    width: '30rem',
    backgroundColor: '#ffffff',
    borderRadius: '32px',
  },
  folderAnchor: {
    position: 'relative',
    width: '280px',
    height: '240px',
    perspective: '1500px',
    cursor: 'pointer',
  },
  backPlate: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '90%',
    backgroundColor: '#000000',
    borderRadius: '32px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  paper: {
    position: 'absolute',
    left: '50%',
    top: '50px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    transformStyle: 'preserve-3d',
    zIndex: 2,
    overflow: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paperLeft: { width: '150px', height: '160px', zIndex: 2 },
  paperMid:  { width: '160px', height: '170px', zIndex: 3 },
  paperRight: { width: '155px', height: '165px', zIndex: 4 },
  
  // GLASS SECTION
  glassPerspectiveWrapper: {
    position: 'absolute',
    bottom: '0px',
    width: '100%',
    height: '90%',
    zIndex: 10,
    transformOrigin: 'bottom center',
    transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  glassShape: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(8px) saturate(180%)',
    WebkitBackdropFilter: 'blur(8px) saturate(180%)',
    border: '1.5px solid rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
    clipPath: 'path("M 0 70 C 0 50 12 38 28 38 L 145 38 C 153 38 158 34 162 28 L 172 18 C 176 13 182 10 190 10 L 252 10 C 270 10 280 20 280 38 L 280 188 C 280 204 270 214 252 214 L 28 214 C 10 214 0 204 0 188 Z")',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.15)',
  },
  glassGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
  },
  glassGrain: {
    position: 'absolute',
    inset: 0,
    opacity: 0.03,
    backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")\`,
  },
  groundShadow: {
    position: 'absolute',
    bottom: '-40px',
    left: '50%',
    width: '80%',
    height: '20px',
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
    filter: 'blur(10px)',
    transition: 'all 0.6s ease',
    zIndex: 0,
  }
};

export default RefinedGlassFolder;`,
      css: `/* No external CSS needed - uses inline styles */`,
    },
  },
  {
    id: "drawer-1",
    name: "Drawer",
    category: "Drawer",
    component: Drawer1,
    code: {
      tsx: `'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  buttonText?: string;
  title?: string;
  description?: string;
}

const Drawer1: React.FC<DrawerProps> = ({
  buttonText = "Open Drawer",
  title = "Drawer for React.",
  description = "This component can be used as a Dialog replacement on mobile and tablet devices. You can read about why and how it was built here.\\n\\nIt comes unstyled, has gesture-driven animations, and is made by Emil Kowalski.\\n\\nIt uses Radix's Dialog primitive under the hood and is inspired by this tweet."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const drawerContent = isOpen ? (
    <div 
      className="fixed inset-0 bg-black/40 z-[99999] transition-opacity duration-300"
      style={{ position: 'fixed' }}
      onClick={() => setIsOpen(false)}
    >
      {/* Drawer Content */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl transform transition-transform duration-300 ease-out"
        style={{
          height: '40vh',
          width: '100vw',
          animation: 'slideUp 300ms ease-out',
          position: 'fixed'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close drawer"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Drawer Body - Centered */}
        <div className="px-6 pb-8 pt-2 overflow-y-auto flex flex-col items-center justify-center" style={{ maxHeight: 'calc(40vh - 60px)' }}>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {title}
            </h2>
            
            <div className="text-gray-600 text-base leading-relaxed space-y-4">
              {description.split('\\n\\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Square Container with Drawer Button */}
      <div className="w-80 h-80 bg-gray-100 rounded-3xl flex items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="px-8 py-4 bg-white border border-gray-300 rounded-full text-gray-900 font-semibold text-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          {buttonText}
        </button>
      </div>

      {/* Portal to render drawer at body level */}
      {mounted && typeof document !== 'undefined' && drawerContent && createPortal(
        drawerContent,
        document.body
      )}

      <style jsx global>{\`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      \`}</style>
    </>
  );
};

export default Drawer1;`,
      css: `/* No external CSS needed - uses Tailwind classes */`,
    },
  },
];

export const showcaseItems: ShowcaseItem[] =
  baseShowcaseItems.flatMap(expandShowcaseItem);
