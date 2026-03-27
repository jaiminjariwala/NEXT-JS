'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

export const ITEM_PREVIEW_SCALE = 0.7;

interface DraggableItemProps {
  id: string;
  position: { x: number; y: number };
  onPositionUpdate: (id: string, position: { x: number; y: number }) => void;
  onClick: () => void;
  children: React.ReactNode;
  isHighlighted?: boolean;
  previewScale?: number;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  position,
  onPositionUpdate,
  onClick,
  children,
  isHighlighted = false,
  previewScale = ITEM_PREVIEW_SCALE,
}) => {
  // Visual state for user feedback
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  // Refs for DOM and drag tracking
  const itemRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, cardX: 0, cardY: 0 });
  
  // Mobile touch handling
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartTimeRef = useRef(0);
  const canDragRef = useRef(false);

  // Get coordinates from mouse or touch event
  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches?.[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
  };

  // Start dragging
  const handleDragStart = useCallback((e: MouseEvent | TouchEvent, coords: { x: number; y: number }) => {
    e.preventDefault();
    e.stopPropagation();
    
    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    
    // Remember starting position
    dragStartRef.current = {
      x: coords.x,
      y: coords.y,
      cardX: position.x,
      cardY: position.y
    };

    // Change cursor to indicate dragging
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    
    // Stop canvas panning when dragging an item
    const canvas = document.querySelector('[data-canvas-container]');
    if (canvas) {
      canvas.setAttribute('data-item-dragging', 'true');
    }
  }, [position.x, position.y]);

  // Desktop: Click and drag immediately
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const coords = getEventCoordinates(e);
    handleDragStart(e, coords);
  }, [handleDragStart]);

  // Mobile: Long press then drag
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const coords = getEventCoordinates(e);
    touchStartTimeRef.current = Date.now();
    canDragRef.current = false;
    
    // Wait 200ms for long press
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      canDragRef.current = true;
      
      // Vibrate to give feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      handleDragStart(e, coords);
    }, 200);
  }, [handleDragStart]);

  // Update position while dragging
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !itemRef.current) return;

    e.preventDefault();
    
    const coords = getEventCoordinates(e);
    const deltaX = coords.x - dragStartRef.current.x;
    const deltaY = coords.y - dragStartRef.current.y;
    
    // Track if user actually moved (to distinguish click from drag)
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasMovedRef.current = true;
    }

    // Update visual position
    const newX = dragStartRef.current.cardX + deltaX;
    const newY = dragStartRef.current.cardY + deltaY;
    itemRef.current.style.left = `${newX}px`;
    itemRef.current.style.top = `${newY}px`;
  }, []);

  // End dragging
  const handleDragEnd = useCallback(() => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If we didn't start dragging, treat it as a click
    if (!isDraggingRef.current) {
      const touchDuration = Date.now() - touchStartTimeRef.current;
      if (touchDuration < 200 && !hasMovedRef.current) {
        onClick();
      }
      canDragRef.current = false;
      setIsLongPressing(false);
      return;
    }

    // Reset drag state
    isDraggingRef.current = false;
    setIsDragging(false);
    setIsLongPressing(false);
    canDragRef.current = false;
    
    // Reset cursor
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Re-enable canvas panning
    const canvas = document.querySelector('[data-canvas-container]');
    if (canvas) {
      canvas.removeAttribute('data-item-dragging');
    }

    if (!itemRef.current) return;

    const moved = hasMovedRef.current;
    
    if (moved) {
      // Save new position
      const finalX = parseInt(itemRef.current.style.left) || position.x;
      const finalY = parseInt(itemRef.current.style.top) || position.y;
      onPositionUpdate(id, { x: finalX, y: finalY });
    } else {
      // No movement = click
      onClick();
    }
  }, [onClick, id, onPositionUpdate, position.x, position.y]);

  // Handle touch cancellation (like phone call)
  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    if (isDraggingRef.current) {
      handleDragEnd();
    }
    
    setIsLongPressing(false);
    canDragRef.current = false;
  }, [handleDragEnd]);

  // Set up global event listeners for smooth dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMove(e);
    const handleGlobalMouseUp = () => handleDragEnd();
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (canDragRef.current) {
        handleMove(e);
      }
    };
    const handleGlobalTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleMove, handleDragEnd, handleTouchCancel]);

  return (
    <div
      ref={itemRef}
      data-draggable-item
      data-item-id={id}
      onMouseDown={handleMouseDown as unknown as React.MouseEventHandler<HTMLDivElement>}
      onTouchStart={handleTouchStart as unknown as React.TouchEventHandler<HTMLDivElement>}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        transform: isDragging ? `scale(${previewScale * 1.05})` : `scale(${previewScale})`,
        transformOrigin: 'top left',
        transition: isDragging ? 'transform 0.1s ease' : 'none',
      }}
      className={`${
        isLongPressing ? 'ring-2 ring-blue-400 ring-opacity-50 rounded-xl' : ''
      } ${
        isDragging ? 'z-50' : ''
      } ${
        isHighlighted ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-transparent rounded-xl shadow-xl shadow-blue-500/50' : ''
      }`}
    >
      {children}
    </div>
  );
};
