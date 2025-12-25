"use client";

import React, { useState, useRef, useMemo } from "react";
import { ArrowUp } from "lucide-react";
import { showcaseItems } from "@/data/componentsData";
import { ShowcaseItem } from "@/types";
import { BaseModal } from "@/components/BaseModal";
import { GlassContainer } from "@/components/GlassContainer";
import "@/styles/scrollbar.css";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (item: ShowcaseItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectComponent,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter components based on search query
  const filteredItems = useMemo(() => {
    if (searchQuery.trim() === "") {
      return showcaseItems;
    }
    const query = searchQuery.toLowerCase();
    return showcaseItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredItems.length > 0) {
      onSelectComponent(filteredItems[0]);
      onClose();
      setSearchQuery("");
    }
  };

  const handleItemClick = (item: ShowcaseItem) => {
    onSelectComponent(item);
    onClose();
    setSearchQuery("");
  };

  // Footer with keyboard hints
  const footer = (
    <>
      <span className="flex items-center gap-2">
        <kbd className="px-2.5 py-1.5 bg-white/40 rounded-lg border border-white/50 font-mono text-[10px] font-medium">ESC</kbd>
        <span>to close</span>
      </span>
      <span className="flex items-center gap-2">
        <kbd className="px-2.5 py-1.5 bg-white/40 rounded-lg border border-white/50 font-mono text-[10px] font-medium">↵</kbd>
        <span>to select</span>
      </span>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      verticalPosition="top"
      footer={footer}
      showHeader={false}
      shouldPreventDrag={(target) => {
        return !!target.closest('button') || !!target.closest('input');
      }}
    >
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="px-6 pt-6 pb-4 z-10 relative">
        <div className="relative flex items-center rounded-[24px] bg-white/30 border border-white/40 shadow-[inset_0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Components..."
            className="w-full px-6 py-4 pr-16 text-lg bg-transparent border-none outline-none text-black placeholder-[#4a4a4a]"
            autoFocus
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
        <GlassContainer>
          <div className="h-full max-h-[400px] overflow-y-auto custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No components found
              </div>
            ) : (
              <div className="p-3">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
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
        </GlassContainer>
      </div>
    </BaseModal>
  );
};
