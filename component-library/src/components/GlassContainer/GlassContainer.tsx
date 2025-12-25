"use client";

import React, { ReactNode } from "react";

interface GlassContainerProps {
  children: ReactNode;
  className?: string;
  allowOverflow?: boolean;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className = "",
  allowOverflow = false,
}) => {
  return (
    <div className={`relative flex-1 min-h-0 rounded-[32px] bg-white/30 border border-white/40 shadow-[inset_0_4px_12px_rgba(0,0,0,0.03)] ${allowOverflow ? '' : 'overflow-hidden'} ${className}`}>
      {children}
    </div>
  );
};
