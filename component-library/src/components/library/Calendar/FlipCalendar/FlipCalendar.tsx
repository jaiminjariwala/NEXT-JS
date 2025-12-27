"use client";

import React, { useState, useEffect, useRef } from "react";

export const FlipCalendar = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState("next"); // 'next' or 'prev'
  const [displayDate, setDisplayDate] = useState(new Date());
  const [targetDate, setTargetDate] = useState(new Date());
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play demo on mount
  useEffect(() => {
    if (!isAutoPlay) return;

    const startAutoPlay = () => {
      let count = 0;
      const flipTypes = ["next", "prev", "next", "prev"];

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

  const handleFlip = (type: string, isAuto = false) => {
    if (isFlipping) return;

    if (!isAuto && isAutoPlay) {
      setIsAutoPlay(false);
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    }

    const next = new Date(displayDate);
    if (type === "next") {
      next.setDate(next.getDate() + 1);
      setDirection("next");
    } else {
      next.setDate(next.getDate() - 1);
      setDirection("prev");
    }

    setTargetDate(next);
    setIsFlipping(true);

    setTimeout(() => {
      setDisplayDate(next);
      setIsFlipping(false);
    }, 1500);
  };

  const currDay = displayDate.toLocaleString("en-US", { weekday: "short" });
  const currNum = displayDate.getDate();
  const targetDay = targetDate.toLocaleString("en-US", { weekday: "short" });
  const targetNum = targetDate.getDate();

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className="relative w-60 h-60 cursor-pointer select-none"
        style={{ perspective: "2000px" }}
      >
        <div className="absolute inset-x-4 bottom-[-16px] h-20 bg-blue-900 rounded-[3rem] opacity-0 blur-sm" />
        <div className="absolute inset-x-1 bottom-[-8px] h-full bg-blue-800 rounded-[3.5rem] shadow-lg" />

        <div className="relative w-full h-full bg-blue-600 rounded-[3.5rem] overflow-hidden shadow-xl flex flex-col">
          {/* TOP HALF BACKGROUND - Added bg-blue-700 for contrast */}
          <div
            onClick={() => handleFlip("prev")}
            className="relative flex-1 bg-blue-700 flex flex-col items-center justify-end overflow-hidden z-10"
          >
            <div className="flex flex-col items-center">
              <span className="text-white text-4xl font-extralight tracking-tight mb-2">
                {isFlipping && direction === "prev" ? targetDay : currDay}
              </span>
              <div className="text-[11rem] font-extralight text-white leading-none translate-y-[50%]">
                {isFlipping && direction === "prev" ? targetNum : currNum}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-black z-20" />

          {/* BOTTOM HALF BACKGROUND - Kept bg-blue-600 */}
          <div
            onClick={() => handleFlip("next")}
            className="relative flex-1 bg-blue-600 flex flex-col items-center justify-start overflow-hidden"
          >
            <div>
              <div className="text-[11rem] font-extralight text-white leading-none -translate-y-[50%]">
                {isFlipping && direction === "next" ? targetNum : currNum}
              </div>
            </div>
          </div>

          {/* THE MOVING LEAF - NEXT */}
          <div
            className={`absolute inset-x-0 bottom-0 h-1/2 bg-blue-500 rounded-b-[3.5rem] origin-top overflow-hidden
              ${isFlipping && direction === "next" ? "z-30" : "z-[-1]"}`}
            style={{
              transform:
                isFlipping && direction === "next"
                  ? "rotateX(-180deg)"
                  : "rotateX(0deg)",
              transition:
                isFlipping && direction === "next"
                  ? "transform 1500ms cubic-bezier(0.4, 0, 0.2, 1)"
                  : "none",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="flex flex-col items-center justify-start h-full">
              <div className="text-[11rem] font-extralight text-white leading-none -translate-y-[50%]">
                {currNum}
              </div>
            </div>
            {/* Shading overlay */}
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-700 ${isFlipping ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          <div
            className={`absolute inset-x-0 top-0 h-1/2 bg-blue-700 rounded-t-[3.5rem] origin-bottom overflow-hidden
              ${isFlipping && direction === "next" ? "z-40" : "z-[-1]"}`}
            style={{
              transform:
                isFlipping && direction === "next"
                  ? "rotateX(0deg)"
                  : "rotateX(180deg)",
              transition:
                isFlipping && direction === "next"
                  ? "transform 1500ms cubic-bezier(0.4, 0, 0.2, 1)"
                  : "none",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="flex flex-col items-center justify-end h-full">
              <span className="text-white text-4xl font-extralight tracking-tight mb-2">
                {targetDay}
              </span>
              <div className="text-[11rem] font-extralight text-white leading-none translate-y-[50%]">
                {targetNum}
              </div>
            </div>
          </div>

          {/* THE MOVING LEAF - PREV */}
          <div
            className={`absolute inset-x-0 top-0 h-1/2 bg-blue-800 rounded-t-[3.5rem] origin-bottom overflow-hidden
              ${isFlipping && direction === "prev" ? "z-30" : "z-[-1]"}`}
            style={{
              transform:
                isFlipping && direction === "prev"
                  ? "rotateX(180deg)"
                  : "rotateX(0deg)",
              transition:
                isFlipping && direction === "prev"
                  ? "transform 1500ms cubic-bezier(0.4, 0, 0.2, 1)"
                  : "none",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="flex flex-col items-center justify-end h-full">
              <span className="text-white text-4xl font-extralight tracking-tight mb-2">
                {currDay}
              </span>
              <div className="text-[11rem] font-extralight text-white leading-none translate-y-[50%]">
                {currNum}
              </div>
            </div>
            {/* Shading overlay */}
            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-700 ${isFlipping ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          <div
            className={`absolute inset-x-0 bottom-0 h-1/2 bg-blue-600 rounded-b-[3.5rem] origin-top overflow-hidden
              ${isFlipping && direction === "prev" ? "z-40" : "z-[-1]"}`}
            style={{
              transform:
                isFlipping && direction === "prev"
                  ? "rotateX(0deg)"
                  : "rotateX(-180deg)",
              transition:
                isFlipping && direction === "prev"
                  ? "transform 1500ms cubic-bezier(0.4, 0, 0.2, 1)"
                  : "none",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="flex flex-col items-center justify-start h-full">
              <div className="text-[11rem] font-extralight text-white leading-none -translate-y-[50%]">
                {targetNum}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 rounded-[3.5rem] pointer-events-none bg-linear-to-tr from-transparent via-white/5 to-white/10" />
      </div>
    </div>
  );
};