"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { BaseModal } from "@/components/BaseModal";
import styles from "./CodeModal.module.css";

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: {
    tsx: string;
    css: string;
  };
  componentName: string;
  component?: React.ComponentType;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  code,
  componentName,
  component: Component,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.tsx);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={componentName}
      maxWidth="max-w-3xl"
      maxHeight="max-h-[90vh]"
      verticalPosition="center"
      shouldPreventDrag={(target) => {
        // Prevent drag on buttons, scrollable code area, and component preview
        return !!target.closest('button') || 
               !!target.closest(`.${styles.scrollableCodeArea}`) ||
               !!target.closest(`.${styles.componentPreview}`);
      }}
    >
      <div className="flex-1 px-6 pb-6 z-10 relative" style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Component Preview Section */}
        {Component && (
          <div 
            className={styles.componentPreview}
            style={{ 
              position: 'relative',
              borderRadius: '32px',
              background: 'rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.03)',
              padding: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '240px',
            }}
          >
            {/* Preview Label */}
            <div className="absolute top-4 left-6 z-30">
              <span className="px-3 py-1 rounded-lg bg-white/70 backdrop-blur-md border border-white/60 text-[10px] font-medium uppercase tracking-widest text-black">
                preview
              </span>
            </div>
            
            {/* Live Component */}
            <div className="scale-70 origin-center">
              <Component />
            </div>
          </div>
        )}

        {/* Code Section */}
        <div style={{ 
          position: 'relative',
          flex: 1,
          minHeight: 0,
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* TSX Label */}
          <div className="absolute top-4 left-6 z-30">
            <span className="px-3 py-1 rounded-lg bg-white/70 backdrop-blur-md border border-white/60 text-[10px] font-medium uppercase tracking-widest text-black">
              tsx
            </span>
          </div>

          {/* Copy Button */}
          <div className="absolute top-3 right-3 z-30">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 border ${
                copied 
                  ? "bg-black text-white border-black scale-95 shadow-md" 
                  : "bg-white/80 text-black border-white shadow-sm hover:bg-white hover:shadow-md active:scale-95"
              }`}
            >
              {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* SCROLLABLE AREA */}
          <div 
            className={`${styles.customScrollbar} ${styles.scrollableCodeArea}`}
            style={{ 
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y pan-x'
            }}
          >
            <div style={{ padding: "4.5rem 2rem 2rem 2rem" }}>
              <SyntaxHighlighter
                language="tsx"
                style={oneLight}
                customStyle={{
                  margin: 0,
                  padding: 0,
                  fontSize: "0.875rem",
                  lineHeight: "1.6",
                  background: "transparent",
                }}
                className={styles.codeTransparent}
              >
                {code.tsx}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};
