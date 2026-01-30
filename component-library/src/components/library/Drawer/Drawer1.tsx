'use client';

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
  description = "This component can be used as a Dialog replacement on mobile and tablet devices. You can read about why and how it was built here.\n\nIt comes unstyled, has gesture-driven animations, and is made by Emil Kowalski.\n\nIt uses Radix's Dialog primitive under the hood and is inspired by this tweet."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const drawerContent = isOpen ? (
    <div 
      className="fixed inset-0 bg-black/40 z-99999 transition-opacity duration-300"
      style={{ position: 'fixed' }}
      onClick={() => setIsOpen(false)}
    >
      {/* Drawer Content */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl transform transition-transform duration-300 ease-out"
        style={{
          height: '44vh',
          width: '100vw',
          animation: 'slideUp 300ms ease-out',
          position: 'fixed'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Handle */}
        <div className="flex justify-center pt-4 pb-4">
          <div className="w-14 h-1.5 bg-[#f1f0ef] rounded-full"></div>
        </div>

        {/* Drawer Body - Centered */}
        <div className=" pt-4 overflow-y-auto flex flex-col items-center justify-center" style={{ maxHeight: 'calc(60vh - 40px)' }}>
          <div className="max-w-[29vw]">
            <h2 className="from-neutral-600 font-normal text-[18px] text-[#464646] mb-5">
              {title}
            </h2>
            
            <div className="text-[#5b5b5b] text-[16.5px] leading-normal space-y-2.5">
              {description.split('\n\n').map((paragraph, index) => (
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
      <div className="w-80 h-80 bg-white rounded-3xl flex items-center justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="px-8 py-4 bg-white border border-[#dadada] rounded-full text-[#6a6a6a] font-normal text-2xl hover:bg-[#fcfcfc] transition-colors shadow-xs"
        >
          {buttonText}
        </button>
      </div>

      {/* Portal to render drawer at body level */}
      {mounted && typeof document !== 'undefined' && drawerContent && createPortal(
        drawerContent,
        document.body
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Drawer1;
