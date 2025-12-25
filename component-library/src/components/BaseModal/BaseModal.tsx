"use client";

import React, { useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDraggable } from "@/hooks/useDraggable";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  verticalPosition?: "center" | "top";
  footer?: ReactNode;
  shouldPreventDrag?: (target: HTMLElement) => boolean;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-3xl",
  maxHeight = "max-h-[60vh]",
  verticalPosition = "center",
  footer,
  shouldPreventDrag,
}) => {
  const {
    elementRef,
    isDragging,
    isCentered,
    handleMouseDown,
    handleTouchStart,
    resetPosition,
  } = useDraggable({
    initialPosition: { x: 0, y: 0 },
    centered: true,
    shouldPreventDrag: shouldPreventDrag || ((target) => {
      return !!target.closest('button');
    }),
  });

  useEffect(() => {
    if (isOpen) {
      resetPosition();
    }
  }, [isOpen, resetPosition]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className={`fixed inset-0 flex ${
            verticalPosition === "center" ? "items-center justify-center" : "items-start justify-center pt-32"
          } z-50 p-6 bg-white/5`}
          style={{ backdropFilter: "blur(12px) saturate(120%)" }}
          onClick={onClose}
        >
          <motion.div
            ref={elementRef}
            initial={{ 
              scale: 0.96, 
              opacity: 0, 
              y: 8,
            }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
            }}
            exit={{ 
              scale: 0.98, 
              opacity: 0, 
              y: 4,
              transition: { duration: 0.08, ease: [0.4, 0, 1, 1] }
            }}
            transition={{
              duration: 0.15,
              ease: [0.19, 1, 0.22, 1]
            }}
            style={{ 
              position: isCentered ? 'relative' : 'absolute',
              willChange: isDragging ? 'transform' : 'auto',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
            }}
            drag={false}
            className={`
              w-full ${maxWidth} ${maxHeight} flex flex-col
              rounded-[40px] overflow-hidden
              bg-white/60 backdrop-blur-3xl
              border border-white/80
              shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1),0_0_40px_rgba(180,220,255,0.3),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-10px_20px_rgba(255,255,255,0.5)]
              z-10
            `}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Specular highlight */}
            <div className="absolute top-6 left-12 w-24 h-4 bg-linear-to-r from-white/80 to-transparent rounded-full blur-md -rotate-12 pointer-events-none" />

            {/* Header */}
            <div className="flex-none flex items-center justify-between p-5.5 pt-5 pl-7 pb-4 z-10 relative">
              <h2 className="text-2xl font-semibold text-black tracking-tight">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 bg-white/40 hover:bg-white/80 rounded-full transition-all text-black border border-white/50 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Content */}
            {children}

            {/* Footer */}
            {footer && (
              <div className="px-7 py-4 border-t border-white/30 text-xs text-gray-600 flex items-center justify-between z-10 relative bg-white/20">
                {footer}
              </div>
            )}

            {/* Bottom Ambient Glow */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-white/80 to-transparent pointer-events-none z-20" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
