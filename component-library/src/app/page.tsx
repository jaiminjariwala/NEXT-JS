'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@/components/Canvas/Canvas';
import { SearchModal } from '@/components/SearchModal/SearchModal';
import { ShowcaseItem } from '@/types';

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  const handleSearchSelect = (item: ShowcaseItem) => {
    setHighlightedItemId(item.id);
    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedItemId(null);
    }, 3000);
  };

  // Keyboard shortcut: Cmd+K or Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <main className="flex-1 h-full overflow-hidden">
        <Canvas
          highlightedItemId={highlightedItemId}
          onSearchClick={() => setIsSearchOpen(true)}
        />
      </main>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectComponent={handleSearchSelect}
      />
    </div>
  );
}
