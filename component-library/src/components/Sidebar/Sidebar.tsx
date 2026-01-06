"use client";

import React, { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onSearchClick: () => void;
}

export const Sidebar: React.FC<NavbarProps> = ({ onSearchClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { name: "Home", onClick: () => router.push("/") },
    { name: "Search", onClick: onSearchClick },
    { name: "Library", onClick: () => {} },
  ];

  // Mobile menu items (without Search)
  const mobileMenuItems = navItems.filter(item => item.name !== "Search");

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsMenuOpen(false); // Close menu after clicking
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <nav className="hidden md:flex left-0 top-0 h-screen w-50 bg-[#ebf9ff] text-black flex-col items-center">
        <div className="flex flex-col flex-1 overflow-y-auto w-[200px] gap-40">
          {/* Logo / Title */}
          <div className="bg-[#d8eff9]">
            <div className="mx-3 my-3">
              <h1 className="pl-1.5 text-3xl font-base tracking-tight text-black">
                Component<br />
                Library
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

      {/* Mobile Navbar - Visible only on mobile */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-[#ebf9ff] text-black z-50 border-b border-[#d8eff9]">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo / Title */}
          <h1 className="text-2xl font-base tracking-tight text-black">
            Jaimin<br />
            Designed<br />
            Components
          </h1>

          {/* Search and Hamburger Buttons */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={onSearchClick}
              className="p-2 rounded-lg hover:bg-[#d8eff9] transition-colors duration-200"
              aria-label="Search"
            >
              <Search size={24} />
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-[#d8eff9] transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Only Home, Library */}
        {isMenuOpen && (
          <div className="bg-[#d8eff9] border-t border-[#c5e5f2]">
            <ul className="flex flex-col px-4 py-2 gap-1">
              {mobileMenuItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavClick(item)}
                    className="w-full text-left px-2 py-2 text-xl font-medium text-black hover:bg-black hover:text-white rounded-lg transition-all duration-200"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Spacer for mobile to prevent content from going under fixed navbar */}
      <div className="md:hidden h-[88px]" />
    </>
  );
};
