"use client";

import React from "react";

interface NavbarProps {
  onSearchClick: () => void;
}

export const Sidebar: React.FC<NavbarProps> = ({ onSearchClick }) => {
  const navItems = [
    { name: "Home", onClick: () => {} },
    { name: "Search", onClick: onSearchClick },
    { name: "Library" },
    { name: "Documentation" },
  ];

  return (
    <nav className="left-0 top-0 h-screen w-50 bg-[#ebf9ff] text-black flex flex-col items-center">
      <div className="flex flex-col flex-1 overflow-y-auto w-[200px] gap-40">
        {/* Logo / Title */}
        <div className="bg-[#d8eff9]">
          <div className="mx-3 my-3">
            <h1 className="pl-1.5 text-3xl font-base tracking-tight text-black">
              Jaimin<br></br>
              Designed<br></br>
              Components
            </h1>
          </div>
        </div>

        {/* Navigation List */}
        <ul className="flex flex-col mx-4 gap-1.5">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={item.onClick}
                className="text-left px-2 py-0.5 text-xl font-medium text-black hover:bg-black hover:text-white rounded-lg transition-all duration-200"
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
