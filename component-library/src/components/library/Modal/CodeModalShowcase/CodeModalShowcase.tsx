'use client';

import React, { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from '@/components/CodeModal/CodeModal.module.css';

const sampleCode = {
  tsx: `'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const CodeModal = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-container">
      <button onClick={handleCopy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <SyntaxHighlighter language="tsx" style={oneLight}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};`,
  css: `/* No external CSS needed */`,
};

export const CodeModalShowcase = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sampleCode.tsx);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-[900px] h-[700px] overflow-hidden rounded-3xl shadow-2xl">
      {/* Background Image */}
      <img
        src="/sample-photo-1.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Modal Content - Perfectly Centered */}
      <div className="absolute inset-0 flex items-center justify-center p-16">
        <div className="w-full h-full flex flex-col rounded-[40px] overflow-hidden bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1),0_0_40px_rgba(180,220,255,0.3),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-10px_20px_rgba(255,255,255,0.5)]">
          
          {/* Specular highlight */}
          <div className="absolute top-6 left-12 w-24 h-4 bg-gradient-to-r from-white/80 to-transparent rounded-full blur-md -rotate-12 pointer-events-none" />

          {/* Header */}
          <div className="flex-none flex items-center justify-between p-5.5 pt-5 pl-7 pb-4 z-10 relative">
            <h2 className="text-2xl font-semibold text-black tracking-tight">
              Code Modal Component
            </h2>
            <button className="p-2 bg-white/40 hover:bg-white/80 rounded-full transition-all text-black border border-white/50 shadow-sm">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 pb-6 z-10 relative" style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                className={styles.customScrollbar}
                style={{ 
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                  WebkitOverflowScrolling: 'touch',
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
                    {sampleCode.tsx}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Ambient Glow */}
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </div>
  );
};
