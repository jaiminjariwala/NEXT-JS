"use client";

import React, { useState, useEffect } from "react";

export const DateCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = currentDate.toLocaleString("en-US", { month: "short" });

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
      <div className="flex flex-col justify-center items-start grow">
        <span
          className="text-[6rem] font-bold leading-[0.75] text-black m-0 p-0 block"
          style={{
            WebkitTextStroke: "2px black",
          }}
        >
          {day}
        </span>
        <span
          className="text-[6rem] font-bold leading-[0.9] text-black m-0 p-0 block"
          style={{
            WebkitTextStroke: "2px black",
          }}
        >
          {month}
        </span>
      </div>
    </div>
  );
};
