'use client';

import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { showcaseItems } from '@/data/componentsData';

export const SearchModalShowcase = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = searchQuery.trim() === '' 
    ? showcaseItems 
    : showcaseItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative w-[700px] h-[600px] overflow-hidden rounded-3xl shadow-2xl">
      {/* Background Image */}
      <img
        src="/sample-photo-1.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Modal Content - Perfectly Centered */}
      <div className="absolute inset-0 flex items-center justify-center p-16">
        <div className="w-full flex flex-col rounded-[40px] overflow-hidden bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1),0_0_40px_rgba(180,220,255,0.3),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-10px_20px_rgba(255,255,255,0.5)]">
          
          {/* Specular highlight */}
          <div className="absolute top-6 left-12 w-24 h-4 bg-gradient-to-r from-white/80 to-transparent rounded-full blur-md -rotate-12 pointer-events-none" />

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="px-6 pt-6 pb-4 z-10 relative">
            <div className="relative flex items-center rounded-[24px] bg-white/30 border border-white/40 shadow-[inset_0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Components..."
                className="w-full px-6 py-4 pr-16 text-lg bg-transparent border-none outline-none text-black placeholder-[#4a4a4a]"
              />
              <button
                type="submit"
                className={`absolute right-3 p-2.5 rounded-full transition-all duration-300 border ${
                  filteredItems.length === 0
                    ? "bg-white/40 text-gray-400 border-white/60 cursor-not-allowed"
                    : "bg-white/80 hover:bg-black text-black hover:text-white border-white shadow-sm active:scale-95"
                }`}
                disabled={filteredItems.length === 0}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          </form>

          {/* Results */}
          <div className="flex-1 min-h-0 px-6 pb-6 z-10 relative flex flex-col mt-2">
            <div style={{
              position: 'relative',
              borderRadius: '32px',
              background: 'rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.03)',
              overflow: 'hidden'
            }}>
              <div className="h-full max-h-[280px] overflow-y-auto custom-scrollbar">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No components found
                  </div>
                ) : (
                  <div className="p-3">
                    {filteredItems.slice(0, 5).map((item) => (
                      <button
                        key={item.id}
                        className="w-full text-left px-5 py-4 rounded-2xl hover:bg-white/50 transition-all duration-200 flex items-center justify-between group active:scale-[0.98]"
                      >
                        <div>
                          <div className="font-semibold text-gray-800 text-base">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {item.category}
                          </div>
                        </div>
                        <ArrowUp
                          size={16}
                          className="text-gray-400 group-hover:text-black rotate-45 transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 py-4 border-t border-white/30 text-xs text-gray-600 flex items-center justify-between z-10 relative bg-white/20">
            <span className="flex items-center gap-2">
              <kbd className="px-2.5 py-1.5 bg-white/40 rounded-lg border border-white/50 font-mono text-[10px] font-medium">ESC</kbd>
              <span>to close</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2.5 py-1.5 bg-white/40 rounded-lg border border-white/50 font-mono text-[10px] font-medium">↵</kbd>
              <span>to select</span>
            </span>
          </div>

          {/* Bottom Ambient Glow */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </div>
  );
};
